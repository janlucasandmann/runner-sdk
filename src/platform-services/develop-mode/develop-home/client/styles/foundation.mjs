export const DEVELOP_HOME_FOUNDATION_CSS = `      .playground-develop-home {
        width: 100%;
        height: 100%;
        min-height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 42px 44px 56px;
        box-sizing: border-box;
        background: #000;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .playground-develop-home::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

      .playground-develop-home-inner {
        width: min(100%, var(--playground-centered-page-max-width));
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .playground-develop-overview-controls-slot,
      .playground-develop-webhooks-overview-controls-slot {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        flex-wrap: nowrap;
        white-space: nowrap;
      }

`;
