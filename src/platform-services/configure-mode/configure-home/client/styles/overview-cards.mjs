export const CONFIGURE_HOME_OVERVIEW_CARDS_CSS = `      .configure-home-overview__teasers {
        flex: 0 0 auto;
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .configure-home-overview__teaser {
        box-sizing: border-box;
        min-width: 0;
        min-height: 132px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        appearance: none;
        border: 0;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.94);
        background: rgba(255, 255, 255, 0.075);
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease, transform 160ms ease;
      }

      .configure-home-overview__teaser:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
      }

      .configure-home-overview__teaser:focus-visible {
        outline: 1px solid rgba(77, 163, 255, 0.78);
        outline-offset: 3px;
      }

      .configure-home-overview__teaser-top {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        color: rgba(255, 255, 255, 0.42);
      }

      .configure-home-overview__teaser-icon {
        width: 32px;
        height: 32px;
        flex: 0 0 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: rgba(255, 255, 255, 0.88);
        background: rgba(255, 255, 255, 0.08);
      }

      .configure-home-overview__teaser-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .configure-home-overview__teaser-copy strong {
        margin-top: 2px;
        color: #fff;
        font-size: 28px;
        line-height: 1;
        font-weight: 500;
      }

      .configure-home-overview__teaser-copy > span {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        line-height: 1.2;
        font-weight: 500;
      }

      .configure-home-overview__teaser-copy small {
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
      }

      .configure-home-overview__header-menu-surface {
        top: calc(100% + 8px);
        right: 0;
        left: auto;
        width: 200px;
        min-width: 200px;
      }

      @media (max-width: 760px) {
        .configure-home-overview__teasers {
          grid-template-columns: none;
          grid-auto-flow: column;
          grid-auto-columns: minmax(250px, 82vw);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .configure-home-overview__teasers::-webkit-scrollbar { display: none; }
      }

`;
