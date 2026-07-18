export const IMAGINE_PAGE_TOP_NAVIGATION_CSS = String.raw`      .playground-imagine-top-nav-controls {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-imagine-filter-shell {
        flex: 0 0 auto;
      }

      .playground-imagine-top-nav-divider {
        flex: 0 0 1px;
        width: 1px;
        height: 22px;
        margin: 0 2px 0 6px;
        background: rgba(255, 255, 255, 0.15);
      }

      .tb-runner-chat.playground-imagine-runner .tb-context-indicator-anchor {
        display: none;
      }

      @media (max-width: 1080px) {
        .playground-imagine-shell {
          padding-left: 0;
          padding-right: 0;
        }

        .playground-imagine-grid {
          column-count: 3;
        }
      }

      @media (max-width: 760px) {
        .playground-imagine-shell {
          padding: 0;
        }

        .playground-imagine-title-row {
          align-items: flex-start;
          flex-direction: column;
        }

        .playground-imagine-tabs {
          width: 100%;
        }

        .playground-imagine-tab {
          flex: 1 1 0;
          min-width: 0;
        }

        .playground-imagine-grid {
          column-count: 2;
        }

        .playground-imagine-composer-wrap {
          width: calc(100% - 24px);
          bottom: 10px;
        }
      }
`;
