export const IMAGINE_TEMPLATE_DETAIL_SURFACE_CSS = String.raw`      .playground-imagine-template-page {
        position: relative;
        inset: auto;
        z-index: auto;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        isolation: isolate;
        background: #000;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-imagine-template-shell {
        width: 100%;
        height: 100%;
        min-height: 0;
        display: block;
        background: #000;
      }

      .playground-imagine-template-detail {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        background: #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0;
        box-sizing: border-box;
      }

      .playground-imagine-template-back.is-icon-only {
        position: absolute;
        top: 18px;
        left: 18px;
        z-index: 20;
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 0;
        background: transparent;
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        color: rgba(255, 255, 255, 0.86);
        justify-content: center;
      }

      .playground-imagine-template-back.is-icon-only span {
        display: none;
      }

      .playground-imagine-template-top-nav {
        position: absolute;
        top: 18px;
        right: 18px;
        z-index: 20;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-imagine-template-top-nav .playground-imagine-template-preview-nav {
        position: relative;
        inset: auto;
        transform: none;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-top-nav .playground-imagine-template-preview-nav:hover {
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-imagine-template-main {
        position: relative;
        width: var(--imagine-template-main-width, min(56rem, calc(100% - 144px)));
        height: var(--imagine-template-main-height, min(68vh, calc(100% - 170px)));
        max-width: none;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: var(--imagine-template-detail-aspect-ratio, 4 / 3);
      }

      .playground-imagine-template-preview-frame {
        position: relative;
        width: 100%;
        height: 100%;
        max-height: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-imagine-template-preview-stage {
        position: relative;
        width: 100%;
        height: 100%;
        max-height: none;
        aspect-ratio: var(--imagine-template-detail-aspect-ratio, 4 / 3);
        overflow: hidden;
        background: transparent;
        border-radius: 10px;
      }

      .playground-imagine-template-preview-stage::after {
        display: none;
      }

      .playground-imagine-template-slide-shell {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        will-change: transform, opacity;
      }

      .playground-imagine-template-slide-shell.is-current {
        z-index: 2;
        animation: playgroundImagineTemplateSlideIn 460ms cubic-bezier(0.2, 0.85, 0.22, 1) both;
      }

      .playground-imagine-template-slide-shell.is-static {
        z-index: 2;
        animation: none;
      }

      .playground-imagine-template-slide-shell.is-previous {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        animation: playgroundImagineTemplateSlideOut 460ms cubic-bezier(0.2, 0.85, 0.22, 1) both;
      }

      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-video.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-video.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-previous {
        animation: none;
      }

      @keyframes playgroundImagineTemplateSlideIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * 112%));
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes playgroundImagineTemplateSlideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * -112%));
        }
      }

      .playground-imagine-template-preview-media {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
        background: transparent;
      }

      .playground-imagine-template-preview-image,
      .playground-imagine-template-preview-video,
      .playground-imagine-template-preview-fallback {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
        border-radius: inherit;
      }

      .playground-imagine-template-preview-fallback {
        background: var(--imagine-template-preview-bg, linear-gradient(135deg, #171717, #333));
      }

      .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-preview-video.is-current,
      .playground-imagine-template-preview-fallback.is-current {
        animation: playgroundImagineTemplatePreviewInY 320ms ease both;
      }

      .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-preview-video.is-previous,
      .playground-imagine-template-preview-fallback.is-previous {
        position: absolute;
        inset: 0;
        z-index: 1;
        animation: playgroundImagineTemplatePreviewOutY 320ms ease both;
      }

      @keyframes playgroundImagineTemplatePreviewInY {
        from {
          opacity: 0;
          transform: translateY(calc(var(--imagine-template-transition-direction, 1) * 32px));
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes playgroundImagineTemplatePreviewOutY {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(calc(var(--imagine-template-transition-direction, 1) * -32px));
        }
      }

      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-video.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-video.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-previous {
        animation: none !important;
      }

      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-image,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-video,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-fallback {
        position: absolute;
        inset: 0;
      }

      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-video.is-current,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-fallback.is-current {
        z-index: 2;
        animation: playgroundImagineTemplateDetailAssetIn 240ms ease both !important;
      }

      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-video.is-previous,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-fallback.is-previous {
        z-index: 1;
        animation: playgroundImagineTemplateDetailAssetOut 240ms ease both !important;
      }

      @keyframes playgroundImagineTemplateDetailAssetIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-asset-direction, 1) * 112%));
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes playgroundImagineTemplateDetailAssetOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }

        to {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-asset-direction, 1) * -112%));
        }
      }

      .playground-imagine-template-vertical-nav {
        position: absolute;
        left: -50px;
        top: 50%;
        z-index: 8;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-imagine-template-vertical-nav .playground-imagine-template-preview-nav {
        position: static;
        transform: none;
        width: 34px;
        height: 34px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-imagine-template-action-rail {
        position: absolute;
        right: -54px;
        bottom: 0;
        z-index: 14;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .playground-imagine-template-action-spacer {
        display: none;
      }

      .playground-imagine-template-action-button {
        --sidebar-workspace-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.86);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        overflow: hidden;
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        transition: background 140ms ease, color 140ms ease, transform 140ms ease;
      }

      .playground-imagine-template-action-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--sidebar-workspace-border);
        -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        -webkit-mask-clip: content-box, border-box;
        mask-clip: content-box, border-box;
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-imagine-template-action-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-template-action-button:hover,
      .playground-imagine-template-action-button.is-active {
        background: transparent;
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-imagine-template-action-button.is-liked {
        color: #fff;
      }

      .playground-imagine-template-action-button.is-liked svg {
        fill: #fff;
      }

      .playground-imagine-template-action-rail.is-ghost .playground-imagine-template-action-button {
        pointer-events: none;
      }

      .playground-imagine-template-action-popup {
        --platform-popup-padding: 12px;
        position: absolute;
        right: 44px;
        bottom: 0;
        z-index: 18;
        width: min(300px, 72vw);
        max-height: min(420px, calc(100vh - 180px));
        overflow: auto;
        box-sizing: border-box;
        scrollbar-width: none;
      }

      .playground-imagine-template-action-popup::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-template-action-popup-title {
        margin: 0 0 8px;
        color: rgba(255, 255, 255, 0.94);
        font-size: 12px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-imagine-template-action-popup-copy {
        margin: 0;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
      }

      .playground-imagine-template-popup-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-imagine-template-popup-row {
        width: 100%;
        min-height: 38px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.76);
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        padding: 7px 8px;
        box-sizing: border-box;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-imagine-template-popup-row:hover,
      .playground-imagine-template-popup-row.is-selected {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-imagine-template-popup-row.is-danger {
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-imagine-template-popup-row.is-danger:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-imagine-template-popup-row-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-imagine-template-popup-row-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-imagine-template-popup-row-description {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-imagine-template-popup-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
      }

      .playground-imagine-template-popup-button {
        min-width: 72px;
        height: 30px;
        border: 0;
        border-radius: 999px;
        padding: 0 12px;
        font: inherit;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-template-popup-button.is-primary {
        background: #fff;
        color: #000;
      }

      .playground-imagine-template-popup-button.is-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-imagine-template-popup-button:disabled {
        opacity: 0.48;
        cursor: default;
      }

      .playground-imagine-template-popup-error {
        margin: 8px 0 0;
        color: rgba(255, 170, 170, 0.92);
        font-size: 11px;
        line-height: 1.35;
        font-weight: 400;
      }

      .playground-imagine-template-popup-dropzone {
        width: 100%;
        min-height: 106px;
        border: 1px dashed rgba(255, 255, 255, 0.18);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px;
        box-sizing: border-box;
        font: inherit;
        text-align: center;
        cursor: pointer;
      }

      .playground-imagine-template-popup-dropzone.is-dragging {
        border-color: rgba(102, 166, 255, 0.7);
        background: rgba(102, 166, 255, 0.1);
      }

      .playground-imagine-template-popup-attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }

`;
