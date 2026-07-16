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
        overflow: auto;
        scrollbar-width: thin;
      }

      .playground-shell-settings-modal-body .playground-settings-page.is-embedded,
      .playground-shell-settings-modal-body .playground-settings-detail-scroll {
        min-height: 0;
      }

      .playground-shell-settings-modal-body .playground-settings-account-shell.is-wide {
        max-width: none;
      }

      @media (max-width: 640px) {
        .playground-shell-settings-modal.platform-modal-surface {
          width: 100%;
          height: min(720px, calc(100dvh - 24px));
          max-height: calc(100dvh - 24px);
        }
      }
`;
