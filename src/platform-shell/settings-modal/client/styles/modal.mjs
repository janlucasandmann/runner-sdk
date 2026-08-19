export const SETTINGS_MODAL_CSS = String.raw`
      .playground-shell-settings-modal.platform-modal-surface {
        width: min(950px, calc(100vw - 48px));
        height: min(720px, calc(100dvh - 48px));
        max-width: 950px;
        max-height: calc(100dvh - 48px);
        display: flex;
        flex-direction: column;
        overflow: hidden !important;
      }

      .playground-shell-settings-modal-body.platform-modal-body {
        position: relative;
        z-index: 6;
        flex: 1 1 auto;
        min-height: 0;
        padding: 0;
        overflow: hidden;
      }

      .playground-shell-settings-modal-layout {
        --platform-modal-sidebar-width: 240px;
        width: 100%;
        height: 100%;
      }

      .playground-shell-settings-modal-sidebar.platform-modal-sidebar {
        background: transparent;
      }

      .playground-shell-settings-modal-sidebar-body.platform-modal-sidebar__body {
        display: flex;
        flex-direction: column;
        padding: 12px;
      }

      .playground-shell-settings-modal-account {
        box-sizing: border-box;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 8px 16px;
        color: #fff;
      }

      .playground-shell-settings-modal-account-avatar {
        position: relative;
        width: 40px;
        height: 40px;
        flex: 0 0 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        font-weight: 500;
      }

      .playground-shell-settings-modal-account-avatar-image {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-shell-settings-modal-account-avatar-fallback {
        width: 100%;
        height: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-transform: uppercase;
      }

      .playground-shell-settings-modal-account-copy {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-shell-settings-modal-account-name,
      .playground-shell-settings-modal-account-email {
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .playground-shell-settings-modal-account-name {
        color: rgba(255, 255, 255, 0.95);
        font-size: 14px;
        font-weight: 500;
      }

      .playground-shell-settings-modal-account-email {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        font-weight: 400;
      }

      .playground-shell-settings-modal-page-title,
      .playground-shell-settings-modal-content .playground-environments-detail-title {
        margin: 0;
        color: #fff;
        font-size: 18px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-shell-settings-modal-content .playground-settings-records-subtitle {
        margin: 2px 0 0;
      }

      .playground-shell-settings-modal input:not([type]),
      .playground-shell-settings-modal input[type="text"],
      .playground-shell-settings-modal input[type="email"],
      .playground-shell-settings-modal input[type="password"],
      .playground-shell-settings-modal input[type="number"],
      .playground-shell-settings-modal input[type="search"],
      .playground-shell-settings-modal input[type="tel"],
      .playground-shell-settings-modal input[type="url"] {
        border: none !important;
      }

      .playground-shell-settings-modal-notification-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-shell-settings-modal-notification-row {
        min-width: 0;
        min-height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-shell-settings-modal-notification-copy {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-shell-settings-modal-notification-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.35;
      }

      .playground-shell-settings-modal-notification-description,
      .playground-shell-settings-modal-notification-note {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.45;
      }

      .playground-shell-settings-modal-notification-row .platform-toggle {
        flex: 0 0 auto;
      }

      .playground-shell-settings-modal-data-controls-intro {
        max-width: 42rem;
        margin: 8px 0 18px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.5;
      }

      .playground-shell-settings-modal-data-control-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-shell-settings-modal-data-control-row {
        min-width: 0;
        min-height: 58px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-shell-settings-modal-data-control-copy {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-shell-settings-modal-data-control-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.35;
      }

      .playground-shell-settings-modal-data-control-description {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.4;
      }

      .playground-shell-settings-modal-data-control-delete.platform-button {
        flex: 0 0 auto;
        color: #ff6b6b;
      }

      .playground-shell-settings-modal-data-control-delete.platform-button:hover,
      .playground-shell-settings-modal-data-control-delete.platform-button:focus-visible {
        color: #ff8585;
      }

      .playground-settings-marketing-toggle-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .playground-settings-marketing-toggle-copy {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-settings-marketing-toggle-row .platform-toggle {
        flex: 0 0 auto;
      }

      .playground-settings-email-field-header {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 4px;
      }

      .playground-settings-email-field-header .playground-settings-account-inline {
        flex: 0 1 auto;
        justify-content: flex-end;
        margin-top: 0;
      }

      .playground-shell-settings-modal-navigation {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-shell-settings-modal-navigation-item {
        box-sizing: border-box;
        width: 100%;
        min-height: 36px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 10px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, 0.68);
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        text-align: left;
        cursor: pointer;
        transition:
          background-color 120ms ease,
          color 120ms ease;
      }

      .playground-shell-settings-modal-navigation-item:hover,
      .playground-shell-settings-modal-navigation-item:focus-visible {
        background: rgba(255, 255, 255, 0.075);
        color: #fff;
        outline: none;
      }

      .playground-shell-settings-modal-navigation-item.is-active {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .playground-shell-settings-modal-navigation-item.is-danger {
        margin-top: auto;
      }

      .playground-shell-settings-modal-navigation-item.is-danger:not(.is-active) {
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-shell-settings-modal-navigation-icon {
        flex: 0 0 auto;
      }

      .playground-shell-settings-modal-content-body.platform-modal-content__body {
        display: block;
        padding: 24px;
        overflow-y: auto;
        scrollbar-width: thin;
      }

      .playground-shell-settings-modal-body .playground-settings-page.is-embedded,
      .playground-shell-settings-modal-body .playground-settings-detail-scroll {
        min-height: 0;
        background: transparent !important;
      }

      .playground-shell-settings-modal-body .playground-settings-page.is-embedded {
        width: 100%;
      }

      .playground-shell-settings-modal-body .playground-settings-account-shell.is-wide {
        max-width: none;
      }

      @media (max-width: 720px) {
        .playground-shell-settings-modal.platform-modal-surface {
          width: 100%;
          height: min(720px, calc(100dvh - 24px));
          max-height: calc(100dvh - 24px);
        }

        .playground-shell-settings-modal-layout {
          display: flex;
          flex-direction: column;
        }

        .playground-shell-settings-modal-sidebar.platform-modal-sidebar {
          width: 100%;
          flex: 0 0 auto;
          border-right: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .playground-shell-settings-modal-sidebar-body.platform-modal-sidebar__body {
          padding: 8px 12px;
          overflow-x: auto;
        }

        .playground-shell-settings-modal-navigation {
          min-height: 0;
          flex-direction: row;
        }

        .playground-shell-settings-modal-account {
          padding: 4px 8px 12px;
        }

        .playground-shell-settings-modal-navigation-item {
          width: auto;
          flex: 0 0 auto;
        }

        .playground-shell-settings-modal-navigation-item.is-danger {
          margin-top: 0;
        }

        .playground-shell-settings-modal-content-body.platform-modal-content__body {
          padding: 20px;
        }
      }
`;
