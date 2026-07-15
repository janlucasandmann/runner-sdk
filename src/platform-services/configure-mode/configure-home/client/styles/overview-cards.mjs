export const CONFIGURE_HOME_OVERVIEW_CARDS_CSS = `      .playground-configure-home-inner.playground-develop-home-inner {
        gap: 12px;
      }

      .playground-configure-home-inner.playground-develop-home-inner .playground-configure-usage-metrics,
      .playground-configure-home-inner.playground-develop-home-inner .playground-configure-overview-cards,
      .playground-configure-home-inner.playground-develop-home-inner .playground-configure-sections {
        margin-top: 12px;
      }

      .playground-configure-overview-cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .playground-configure-overview-card {
        min-width: 0;
        min-height: 132px;
        padding: 18px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.075);
        color: rgba(255, 255, 255, 0.94);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
        text-align: left;
        cursor: pointer;
        box-sizing: border-box;
        transition: background-color 160ms ease, transform 160ms ease;
      }

      .playground-configure-overview-card:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-1px);
      }

      .playground-configure-overview-card-top {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-configure-overview-card-icon {
        width: 32px;
        height: 32px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.88);
        flex: 0 0 auto;
      }

      .playground-configure-overview-card-icon svg {
        width: 15px;
        height: 15px;
      }

      .playground-configure-overview-card-arrow {
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.42);
        flex: 0 0 auto;
      }

      .playground-configure-overview-card-value {
        margin-top: 2px;
        color: #fff;
        font-size: 28px;
        line-height: 1;
        font-weight: 500;
      }

      .playground-configure-overview-card-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-configure-overview-card-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-configure-overview-card-description {
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
      }
`;
