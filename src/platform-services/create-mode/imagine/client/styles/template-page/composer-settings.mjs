export const IMAGINE_TEMPLATE_COMPOSER_SETTINGS_CSS = String.raw`      .playground-imagine-template-composer-wrap {
        position: relative;
        left: auto;
        bottom: auto;
        z-index: 10;
        width: min(49vw, 760px);
        max-width: calc(100vw - 240px);
        min-width: 320px;
        transform: none;
        margin-top: 16px;
      }

      .playground-imagine-template-detail {
        padding: 0;
      }

      .playground-imagine-template-main {
        position: absolute;
        top: var(--imagine-template-main-top, 24px);
        left: 50%;
        z-index: 4;
        width: var(--imagine-template-main-width, min(56rem, calc(100% - 144px)));
        height: var(--imagine-template-main-height, min(68vh, calc(100% - 170px)));
        max-height: none;
        aspect-ratio: var(--imagine-template-detail-aspect-ratio, 4 / 3);
        max-width: none;
        min-width: 0;
        transform: translateX(-50%);
      }

      .playground-imagine-template-preview-frame,
      .playground-imagine-template-flip-card,
      .playground-imagine-template-flip-inner {
        width: 100%;
        height: 100%;
        aspect-ratio: var(--imagine-template-detail-aspect-ratio, 4 / 3);
      }

      .playground-imagine-template-flip-card {
        position: relative;
        perspective: 1600px;
      }

      .playground-imagine-template-flip-inner {
        position: relative;
        transform-style: preserve-3d;
        transition: transform 460ms cubic-bezier(0.2, 0.85, 0.22, 1);
      }

      .playground-imagine-template-flip-card.is-flipped .playground-imagine-template-flip-inner {
        transform: rotateY(180deg);
      }

      .playground-imagine-template-flip-face {
        position: absolute;
        inset: 0;
        border-radius: 10px;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        overflow: hidden;
      }

      .playground-imagine-template-flip-face.is-back {
        transform: rotateY(180deg);
      }

      .playground-imagine-template-preview-stage {
        width: 100%;
        height: 100%;
        max-height: none;
      }

      .playground-imagine-template-settings-back {
        width: 100%;
        height: 100%;
        overflow: auto;
        scrollbar-width: none;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-imagine-template-settings-back::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-template-settings-back-title {
        width: 100%;
        flex: 0 0 auto;
        box-sizing: border-box;
        margin: 0;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.94);
        font-size: 18px;
        line-height: 1.2;
        font-weight: 400;
        letter-spacing: -0.01em;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-attachments-toolbar {
        margin-top: 12px;
        margin-bottom: 12px;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-attachments-surface,
      .playground-imagine-template-settings-back .playground-imagine-template-dropzone {
        min-height: 132px;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-connectors-list {
        column-gap: 18px;
      }

      .playground-imagine-template-action-button.is-editing {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-imagine-template-composer-wrap {
        position: absolute;
        left: 50%;
        bottom: 10px;
        z-index: 18;
        width: min(56rem, calc(100% - 64px));
        max-width: none;
        min-width: 0;
        transform: translateX(-50%);
        margin-top: 0;
      }

      @media (max-width: 960px) {
        .playground-imagine-template-main {
          width: var(--imagine-template-main-width, min(82vw, 640px));
          max-width: none;
        }

        .playground-imagine-template-composer-wrap {
          width: min(82vw, 640px);
          max-width: 100%;
        }

        .playground-imagine-template-vertical-nav {
          left: -42px;
        }

        .playground-imagine-template-action-rail {
          right: -42px;
        }
      }

      @media (max-width: 640px) {
        .playground-imagine-template-detail {
          padding: 0;
        }

        .playground-imagine-template-main {
          width: var(--imagine-template-main-width, calc(100% - 96px));
          max-width: none;
        }

        .playground-imagine-template-composer-wrap {
          width: 100%;
          min-width: 0;
        }

        .playground-imagine-template-preview-stage {
          max-height: calc(100vh - 210px);
        }
      }
`;
