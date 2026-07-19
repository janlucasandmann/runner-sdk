export const CONFIGURE_HOME_NOTIFICATION_PAGE_CSS = `      .configure-home-notification__identity {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .configure-home-notification__icon {
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: rgba(255, 255, 255, 0.88);
        background: rgba(255, 255, 255, 0.06);
      }

      .configure-home-notification__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .configure-home-notification__title,
      .configure-home-notification__meta {
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .configure-home-notification__title {
        color: #fff;
        font-weight: 500;
      }

      .configure-home-notification__meta {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        font-weight: 400;
      }

      .configure-home-notification__status {
        min-height: 22px;
        padding: 0 8px;
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.58);
        background: rgba(255, 255, 255, 0.06);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .configure-home-notification__status.is-unread {
        color: #9ec5ff;
        background: rgba(102, 166, 255, 0.14);
      }

      .platform-empty-state.configure-home-notification__empty-state {
        margin-top: 36px;
        margin-bottom: 36px;
      }
`;
