export const PROJECT_ICON_PICKER_CSS_FRAGMENT = String.raw`
      .platform-project-icon-picker {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        gap: 10px;
      }

      .platform-project-icon-picker__trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 32px;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #fff;
        cursor: pointer;
      }

      .platform-project-icon-picker__trigger:disabled {
        cursor: default;
        opacity: 1;
      }

      .platform-project-icon-picker__trigger-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 32px;
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 8px;
        background: color-mix(in srgb, var(--project-icon-color) 18%, transparent);
        color: var(--project-icon-color);
        transition: background-color 120ms ease;
      }

      .platform-project-icon-picker__trigger:not(:disabled):hover .platform-project-icon-picker__trigger-icon,
      .platform-project-icon-picker__trigger.is-open .platform-project-icon-picker__trigger-icon {
        background: color-mix(in srgb, var(--project-icon-color) 25%, transparent);
      }

      .platform-project-icon-picker__project-name {
        min-width: 0;
        overflow: hidden;
        color: #fff;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .platform-project-icon-picker__emoji {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      .platform-project-icon-picker__popup {
        display: flex;
        flex-direction: column;
        overflow: hidden !important;
      }

      .platform-project-icon-picker__tabs {
        padding: 8px 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .platform-project-icon-picker__colors {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        margin: 0;
        padding: 14px 16px;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .platform-project-icon-picker__color,
      .platform-project-icon-picker__custom-color {
        position: relative;
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        cursor: pointer;
      }

      .platform-project-icon-picker__color::after {
        position: absolute;
        inset: -3px;
        border: 1px solid transparent;
        border-radius: inherit;
        content: "";
      }

      .platform-project-icon-picker__color.is-selected::after {
        border-color: rgba(255, 255, 255, 0.82);
      }

      .platform-project-icon-picker__custom-color {
        background:
          conic-gradient(
            #f55 0deg,
            #fc0 60deg,
            #5d5 120deg,
            #3cc 180deg,
            #58f 240deg,
            #d5f 300deg,
            #f55 360deg
          );
      }

      .platform-project-icon-picker__color-divider {
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
      }

      .platform-project-icon-picker__color-input {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .platform-project-icon-picker__search {
        padding: 12px 16px 8px;
      }

      .platform-project-icon-picker__search .platform-search {
        width: 100%;
      }

      .platform-project-icon-picker__grid {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        align-content: start;
        flex: 1 1 auto;
        gap: 4px;
        max-height: min(360px, calc(100vh - 180px));
        min-width: 0;
        min-height: 0;
        margin: 0;
        padding: 4px 16px 16px;
        border: 0;
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: none;
        touch-action: pan-y;
        -webkit-overflow-scrolling: touch;
      }

      .platform-project-icon-picker__grid::-webkit-scrollbar {
        display: none;
      }

      .platform-project-icon-picker__option {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        aspect-ratio: 1;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
      }

      .platform-project-icon-picker__option:hover,
      .platform-project-icon-picker__option.is-selected {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .platform-project-icon-picker__option.is-emoji {
        font-size: 19px;
        line-height: 1;
      }

      .platform-project-icon-picker__empty {
        grid-column: 1 / -1;
        padding: 32px 0;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        text-align: center;
      }

      .playground-project-breadcrumb-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 14px;
        width: 14px;
        height: 14px;
        color: var(--project-icon-color, rgba(255, 255, 255, 0.82));
        line-height: 1;
      }

      .playground-project-breadcrumb-icon > svg,
      .playground-project-breadcrumb-icon > span {
        display: block;
        width: 14px;
        height: 14px;
        color: inherit;
      }

      .playground-project-breadcrumb-icon > .platform-project-icon-picker__emoji,
      .playground-project-breadcrumb-icon > span {
        font-size: 13px !important;
      }

      .playground-project-breadcrumb-actions {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
        margin-left: 2px;
      }

      @media (max-width: 640px) {
        .platform-project-icon-picker__popup {
          width: calc(100vw - 24px) !important;
        }

        .platform-project-icon-picker__grid {
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }
      }
`;
