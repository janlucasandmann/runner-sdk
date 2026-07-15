export const SETTINGS_MODAL_CSS = String.raw`
      .playground-shell-settings-modal.platform-modal-surface {
        --platform-modal-padding: 0;
        width: min(900px, calc(100vw - 48px));
        height: min(720px, calc(100dvh - 48px));
        max-width: 900px;
        max-height: calc(100dvh - 48px);
        display: flex;
        flex-direction: column;
        overflow: hidden !important;
      }

      .playground-shell-settings-modal-header.platform-modal-header {
        position: relative;
        z-index: 6;
        flex: 0 0 auto;
        min-height: 58px;
        margin: 0;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-shell-settings-modal-title-shell {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-shell-settings-modal-title-icon {
        width: 15px;
        height: 15px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-shell-settings-modal-title {
        margin: 0;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.25;
        letter-spacing: 0;
      }

      .playground-shell-settings-modal-close {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: color 120ms ease, background-color 120ms ease;
      }

      .playground-shell-settings-modal-close:hover,
      .playground-shell-settings-modal-close:focus-visible {
        color: #fff;
        background: rgba(255, 255, 255, 0.08);
        outline: none;
      }

      .playground-shell-settings-modal-close-icon {
        width: 15px;
        height: 15px;
      }

      .playground-shell-settings-modal-body.platform-modal-body {
        position: relative;
        z-index: 6;
        flex: 1 1 auto;
        min-height: 0;
        padding: 22px;
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

        .playground-shell-settings-modal-body.platform-modal-body {
          padding: 18px;
        }
      }
`;
