export const APP_HEADER_ACCOUNT_MENU_CSS = `      .account-menu {
        position: fixed;
        left: 12px;
        bottom: 68px;
        width: min(248px, calc(100vw - 24px));
        overflow: hidden;
      }

      .account-menu.is-sidebar-open {
        left: 14px;
        bottom: 80px;
      }

      .account-menu.is-top-nav {
        left: auto;
        right: 12px;
        top: 58px;
        bottom: auto;
        transform-origin: top right;
      }

      .account-menu.is-top-nav[data-platform-popup-animation] {
        transform-origin: top right;
      }

      .account-menu-account-button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: transparent;
        color: white;
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease;
      }

      .account-menu-account-button:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .account-menu-avatar {
        width: 32px;
        height: 32px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .account-menu-account-copy {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .account-menu-account-name {
        min-width: 0;
        font-size: 14px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .account-menu-account-email {
        min-width: 0;
        font-size: 12px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.6);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .account-menu-section {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 0;
      }

      .account-menu-divider {
        height: 1px;
        margin: 4px 0;
        background: rgba(255, 255, 255, 0.1);
      }

      .account-menu-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 0;
        background: transparent;
        color: white;
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease;
      }

      .account-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .account-menu-item.is-disabled {
        cursor: default;
        color: rgba(255, 255, 255, 0.56);
      }

      .account-menu-item.is-signout {
        color: rgba(255, 255, 255, 0.92);
      }

      .account-menu-item-icon,
      .account-menu-item-chevron,
      .profile-editor-close-icon,
      .profile-editor-camera-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .account-menu-item-label {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
      }

      .account-menu-item-copy {
        font-size: 12px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.56);
      }

      .account-menu-item-chevron {
        margin-left: auto;
        color: rgba(255, 255, 255, 0.52);
      }

`;
