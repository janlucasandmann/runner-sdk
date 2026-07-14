export const IMAGINE_PAGE_COMPOSER_CSS = String.raw`      .playground-imagine-composer-wrap {
        position: absolute;
        left: 50%;
        bottom: 10px;
        z-index: 5;
        width: min(56rem, calc(100% - 64px));
        transform: translateX(-50%);
      }

      .playground-imagine-selected-preset {
        width: fit-content;
        max-width: 100%;
        margin: 0 auto 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.42);
        -webkit-backdrop-filter: blur(28px);
        backdrop-filter: blur(28px);
        color: rgba(255, 255, 255, 0.78);
        font-size: 12px;
        line-height: 1;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      }

      .playground-imagine-selected-preset strong {
        color: rgba(255, 255, 255, 0.96);
        font-weight: 400;
      }

      .playground-imagine-selected-preset-clear {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
      }

      .playground-imagine-selected-preset-clear svg {
        width: 12px;
        height: 12px;
      }

      .playground-imagine-composer-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-input-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-input-width,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .embedded-runner-input,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-composer-textarea-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .task-input-controls {
        background: transparent !important;
      }

      .tb-runner-chat.playground-imagine-runner {
        width: 100%;
        min-width: 0;
        display: block;
        flex: 0 0 auto;
        height: auto;
        min-height: 0;
        overflow: visible;
      }

      .tb-runner-chat.playground-imagine-runner .workinglogsbox {
        display: none !important;
      }

      .tb-runner-chat.playground-imagine-runner .tb-input-shell {
        position: static;
        right: auto;
        bottom: auto;
        padding: 0;
        background: none;
        pointer-events: auto;
      }

      .tb-runner-chat.playground-imagine-runner .tb-input-width {
        width: 100%;
        max-width: none;
      }

      .tb-runner-chat.playground-imagine-runner .embedded-runner-input {
        width: 100%;
      }

      .tb-runner-chat.playground-imagine-runner .task-input-box {
        --tb-runner-input-bg: rgba(0, 0, 0, 0.75);
        --tb-task-input-base-bg: rgba(0, 0, 0, 0.75);
        background: rgba(0, 0, 0, 0.75) !important;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

`;
