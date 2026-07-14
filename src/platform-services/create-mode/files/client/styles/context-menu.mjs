export const FILES_CONTEXT_MENU_CSS = `
      .playground-files-context-backdrop {
        position: fixed;
        inset: 0;
        z-index: 300;
      }

      .playground-files-context-menu {
        position: fixed;
        z-index: 301;
        width: 264px;
        overflow: hidden;
        transform-origin: top right;
      }

      .playground-files-context-menu.account-menu-animate-up-in,
      .playground-files-context-menu.account-menu-animate-up-out {
        transform-origin: top right;
      }

      .playground-files-context-title {
        min-width: 0;
        padding: 12px 16px 4px;
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-files-context-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 0;
        padding: 12px 16px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: white;
        font-size: 14px;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-files-context-item:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .playground-files-context-item svg {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
      }

      .playground-files-context-item.is-danger {
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-files-context-divider {
        height: auto;
        margin: 4px 0;
        padding: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
`;
