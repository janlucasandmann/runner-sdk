export const IMAGINE_PAGE_TOP_NAVIGATION_CSS = String.raw`      .playground-imagine-top-nav-controls {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-imagine-top-nav-divider {
        flex: 0 0 1px;
        width: 1px;
        height: 22px;
        margin: 0 2px 0 6px;
        background: rgba(255, 255, 255, 0.15);
      }

      .playground-imagine-top-nav-controls .playground-files-toolbar-anchor,
      .playground-imagine-top-nav-controls .playground-tasks-toolbar-popup-shell {
        position: relative;
      }

      .playground-imagine-top-nav-controls .playground-files-control-button {
        --playground-files-control-button-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        min-height: 30px;
        height: 30px;
        overflow: hidden;
        border: 0;
        background: transparent;
        padding: 0 14px;
        font-size: 12px;
        font-weight: 400;
      }

      .playground-imagine-top-nav-controls .playground-files-control-button.is-active {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-imagine-top-nav-controls .playground-files-control-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-files-control-button-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-imagine-top-nav-controls .playground-files-control-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-top-nav-controls .playground-files-control-button svg {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-imagine-top-nav-controls .playground-tasks-toolbar-popup-menu {
        left: auto;
        right: 0;
        top: calc(100% + 8px);
        min-width: 210px;
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
