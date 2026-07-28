export const SETTINGS_MODAL_CSS = String.raw`
      .playground-shell-settings-modal.platform-modal-surface {
        width: min(900px, calc(100vw - 48px));
        height: min(720px, calc(100dvh - 48px));
        max-width: 900px;
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
        --platform-modal-sidebar-width: 190px;
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

      .playground-shell-settings-modal-navigation {
        min-height: 100%;
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
