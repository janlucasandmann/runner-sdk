export const APP_HEADER_NOTIFICATIONS_POPUP_CSS = `      .notification-menu {
        position: fixed;
        top: 58px;
        right: 12px;
        width: min(360px, calc(100vw - 24px));
        max-height: min(560px, calc(100vh - 76px));
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .notification-menu-header,
      .notification-menu-footer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
      }

      .notification-menu-header {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .notification-menu-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        font-weight: 400;
      }

      .notification-menu-body {
        overflow: auto;
        min-height: 0;
        padding: 6px;
      }

      .notification-menu-item {
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        text-align: left;
      }

      button.notification-menu-item {
        cursor: pointer;
        transition: background-color 160ms ease;
      }

      button.notification-menu-item:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .notification-menu-icon {
        width: 16px;
        height: 16px;
        margin-top: 2px;
        flex-shrink: 0;
        color: #fff;
      }

      .notification-menu-icon.is-warning {
        color: #fff;
      }

      .notification-menu-copy {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .notification-menu-label {
        font-size: 12px;
        font-weight: 400;
        line-height: 1.25;
        color: rgba(255, 255, 255, 0.96);
      }

      .notification-menu-text,
      .notification-menu-meta,
      .notification-menu-empty {
        font-size: 12px;
        font-weight: 400;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.62);
      }

      .notification-menu-meta {
        color: rgba(255, 255, 255, 0.48);
      }

      .notification-menu-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
      }

      .notification-menu-action-button {
        min-height: 28px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
      }

      .notification-menu-action-button:hover:not(:disabled) {
        border-color: rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .notification-menu-action-button.is-primary {
        border-color: #fff;
        background: #fff;
        color: #000;
      }

      .notification-menu-action-button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      .notification-menu-product-html {
        min-width: 0;
      }

      .notification-menu-product-html div,
      .notification-menu-product-html p {
        margin: 0;
      }

      .notification-menu-product-html a {
        color: #9ec5ff;
        text-decoration: none;
      }

      .notification-menu-product-html a:hover {
        text-decoration: underline;
      }

      .notification-menu-empty {
        padding: 18px 10px;
        text-align: center;
      }

      .notification-menu-mark-read {
        width: 100%;
        min-height: 34px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
      }

      .notification-menu-footer .notification-menu-mark-read {
        width: auto;
        flex: 1 1 0;
      }

      .notification-menu,
      .notification-menu * {
        font-size: 12px;
        font-weight: 400;
      }

      .notification-menu-mark-read:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.14);
      }

      .notification-menu-mark-read:disabled {
        opacity: 0.45;
        cursor: default;
      }

`;
