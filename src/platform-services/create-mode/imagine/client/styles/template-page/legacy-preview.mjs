export const IMAGINE_TEMPLATE_LEGACY_PREVIEW_CSS = String.raw`      .playground-imagine-template-preview-pane {
        position: relative;
        isolation: isolate;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        border-radius: 0;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 66px 22px 116px;
        box-sizing: border-box;
      }

      .playground-imagine-template-preview-frame {
        position: relative;
        width: min(100%, 584px);
        max-height: calc(100vh - 206px);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-imagine-template-preview-stage {
        position: relative;
        width: min(500px, calc(100% - 84px));
        max-height: calc(100vh - 206px);
        aspect-ratio: 4 / 5;
        overflow: hidden;
        background: var(--imagine-template-preview-bg, #111);
        border-radius: 10px;
      }

      .playground-imagine-template-preview-media {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
        background: var(--imagine-template-preview-bg, #111);
      }

      .playground-imagine-template-preview-stage::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        overflow: hidden;
        background:
          linear-gradient(to bottom, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.22) 56%, rgba(0, 0, 0, 0.72)),
          radial-gradient(circle at 50% 78%, rgba(0, 0, 0, 0.24), transparent 44%);
      }

      .playground-imagine-template-preview-image,
      .playground-imagine-template-preview-video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-imagine-template-media-controls {
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 12px;
        z-index: 8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        pointer-events: none;
      }

      .playground-imagine-template-media-dots,
      .playground-imagine-template-media-arrows {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        pointer-events: auto;
      }

      .playground-imagine-template-media-dot {
        width: 5px;
        height: 5px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.42);
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-media-dot.is-active {
        background: rgba(255, 255, 255, 0.92);
      }

      .playground-imagine-template-media-arrow {
        width: 24px;
        height: 24px;
        border: 0;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.46);
        color: rgba(255, 255, 255, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        -webkit-backdrop-filter: blur(16px);
        backdrop-filter: blur(16px);
      }

      .playground-imagine-template-media-arrow:hover,
      .playground-imagine-template-media-dot:hover {
        background: rgba(255, 255, 255, 0.18);
      }

      .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-preview-video.is-current {
        animation: playgroundImagineTemplatePreviewIn 280ms ease both;
      }

      .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-preview-video.is-previous {
        position: absolute;
        inset: 0;
        z-index: 1;
        animation: playgroundImagineTemplatePreviewOut 280ms ease both;
      }

      @keyframes playgroundImagineTemplatePreviewIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * 28px));
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes playgroundImagineTemplatePreviewOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * -28px));
        }
      }

      .playground-imagine-template-preview-nav {
        position: absolute;
        top: 50%;
        z-index: 7;
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        transform: translateY(-50%);
      }

      .playground-imagine-template-preview-nav:disabled {
        opacity: 0.32;
        cursor: default;
      }

      .playground-imagine-template-preview-nav.is-previous {
        left: 0;
      }

      .playground-imagine-template-preview-nav.is-next {
        right: 0;
      }

      .playground-imagine-template-preview-copy {
        position: absolute;
        left: 24px;
        right: 24px;
        top: 24px;
        z-index: 2;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        pointer-events: none;
      }

      .playground-imagine-template-preview-title {
        max-width: 28rem;
        color: rgba(255, 255, 255, 0.96);
        font-size: 18px;
        line-height: 1.18;
        font-weight: 500;
        letter-spacing: -0.02em;
        text-shadow: 0 2px 18px rgba(0, 0, 0, 0.42);
      }

      .playground-imagine-template-preview-meta {
        flex: 0 0 auto;
        border-radius: 999px;
        padding: 7px 10px;
        background: rgba(0, 0, 0, 0.36);
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        color: rgba(255, 255, 255, 0.74);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-imagine-template-composer-wrap {
        position: absolute;
        left: 50%;
        bottom: 20px;
        z-index: 6;
        width: min(100%, calc(100% - 44px));
        transform: translateX(-50%);
      }

      .playground-imagine-template-composer-shell,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .tb-input-shell,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .tb-input-width,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .embedded-runner-input,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .tb-composer-textarea-shell,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .task-input-controls {
        background: transparent !important;
      }

      .tb-runner-chat.playground-imagine-template-runner {
        width: 100%;
        min-width: 0;
        display: block;
        flex: 0 0 auto;
        height: auto;
        min-height: 0;
        overflow: visible;
      }

      .tb-runner-chat.playground-imagine-template-runner .workinglogsbox {
        display: none !important;
      }

      .tb-runner-chat.playground-imagine-template-runner .tb-input-shell {
        position: static;
        right: auto;
        bottom: auto;
        padding: 0;
        background: none;
        pointer-events: auto;
      }

      .tb-runner-chat.playground-imagine-template-runner .tb-input-width,
      .tb-runner-chat.playground-imagine-template-runner .embedded-runner-input {
        width: 100%;
        max-width: none;
      }

      .tb-runner-chat.playground-imagine-template-runner .task-input-box {
        --tb-runner-input-bg: rgba(0, 0, 0, 0.35);
        --tb-task-input-base-bg: rgba(0, 0, 0, 0.35);
        background: rgba(0, 0, 0, 0.35) !important;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .tb-runner-chat.playground-imagine-template-runner .tb-context-indicator-anchor {
        display: none;
      }

      .playground-imagine-template-actions {
        margin-top: auto;
        padding-top: 4px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .playground-imagine-template-generate-button {
        flex: 0 0 auto;
      }

      @media (max-width: 1080px) {
        .playground-imagine-template-shell {
          grid-template-columns: minmax(340px, 0.48fr) minmax(0, 0.52fr);
        }
      }

      @media (max-width: 860px) {
        .playground-imagine-template-shell {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto minmax(420px, 1fr);
          overflow: auto;
          scrollbar-width: none;
          background: rgba(6, 6, 10, 0.96);
        }

        .playground-imagine-template-shell::-webkit-scrollbar {
          display: none;
        }

        .playground-imagine-template-config {
          overflow: visible;
        }

        .playground-imagine-template-preview-pane {
          min-height: 520px;
          border-radius: 15px;
        }
      }

      @media (max-width: 640px) {
        .playground-imagine-template-shell {
          padding: 12px;
        }

        .playground-imagine-template-context-grid,
        .playground-imagine-template-style-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-imagine-template-slider {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-imagine-template-composer-wrap {
          width: calc(100% - 24px);
        }
      }

`;
