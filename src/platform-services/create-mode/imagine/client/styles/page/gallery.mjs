export const IMAGINE_PAGE_GALLERY_CSS = String.raw`      .playground-imagine-grid-scroll {
        min-height: 0;
        flex: 1 1 auto;
        overflow: auto;
        padding-top: 0;
        padding-bottom: 0;
        display: flex;
        flex-direction: column;
        scrollbar-width: none;
      }

      .playground-imagine-grid-scroll.is-create-template {
        padding: 24px 0;
      }

      .playground-imagine-grid-scroll::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-grid {
        display: block;
        width: 100%;
        column-count: 3;
        column-gap: 2px;
      }

      @keyframes playgroundImagineTemplateSkeleton {
        0%,
        100% {
          background-color: rgba(255, 255, 255, 0.05);
        }

        50% {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }

      .playground-imagine-template {
        position: relative;
        isolation: isolate;
        width: 100%;
        min-height: 0;
        aspect-ratio: var(--imagine-template-aspect-ratio, 4 / 3);
        margin: 0 0 2px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        break-inside: avoid;
        -webkit-column-break-inside: avoid;
        page-break-inside: avoid;
        overflow: hidden;
        border: 0;
        border-radius: 0;
        background: var(--imagine-template-bg, rgba(255, 255, 255, 0.06));
        background-color: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.94);
        text-align: left;
        cursor: pointer;
        padding: 16px;
        animation: playgroundImagineTemplateSkeleton 4s ease-in-out infinite;
      }

      .playground-imagine-template::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -2;
        background: transparent;
        opacity: 0;
      }

      .playground-imagine-template::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.58));
        opacity: 0;
        transition: opacity 180ms ease;
      }

      .playground-imagine-template-media {
        position: absolute;
        inset: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
        display: block;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-imagine-template-media-image,
      .playground-imagine-template-video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        pointer-events: none;
      }

      .playground-imagine-template-media-layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .playground-imagine-template-media-transition {
        position: absolute;
        inset: 0;
        display: block;
      }

      .playground-imagine-template-media-layer.is-current {
        z-index: 2;
        animation: playgroundImagineTemplateAssetIn 240ms ease both;
      }

      .playground-imagine-template-media-layer.is-static {
        z-index: 2;
      }

      .playground-imagine-template-media-layer.is-previous {
        z-index: 1;
        animation: playgroundImagineTemplateAssetOut 240ms ease both;
      }

      @keyframes playgroundImagineTemplateAssetIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-asset-direction, 1) * 112%));
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes playgroundImagineTemplateAssetOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }

        to {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-asset-direction, 1) * -112%));
        }
      }

      .playground-imagine-template-video-placeholder {
        width: 100%;
        height: 100%;
        background: var(--imagine-template-bg, rgba(255, 255, 255, 0.06));
      }

      .playground-imagine-template-media-controls {
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 12px;
        z-index: 4;
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

      .playground-imagine-template.is-multi-asset .playground-imagine-template-copy {
        bottom: 28px;
      }

      .playground-imagine-template:hover {
        transform: none;
      }

      .playground-imagine-template:hover::after,
      .playground-imagine-template:focus-visible::after {
        opacity: 1;
      }

      .playground-imagine-template.is-selected {
        box-shadow: inset 0 0 0 1px rgba(102, 166, 255, 0.72);
      }

      .playground-imagine-template.is-large {
        min-height: 0;
      }

      .playground-imagine-template.is-wide {
        min-height: 0;
      }

      .playground-imagine-template-copy {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-width: 88%;
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: opacity 180ms ease, transform 180ms ease;
      }

      .playground-imagine-template:hover .playground-imagine-template-copy,
      .playground-imagine-template:focus-visible .playground-imagine-template-copy {
        opacity: 1;
        transform: translateY(0);
      }

      .playground-imagine-template-title {
        font-size: 15px;
        line-height: 1.16;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-imagine-template-description {
        font-size: 12px;
        line-height: 1.45;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-imagine-template-prompt {
        display: none;
      }

      .playground-imagine-empty {
        min-height: 0;
        height: 100%;
        flex: 1 1 auto;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        border-radius: 12px;
        background: transparent;
        color: rgba(255, 255, 255, 0.48);
        font-size: 13px;
        text-align: center;
      }

      .playground-imagine-empty-visual {
        width: 200px;
        max-width: min(200px, 70vw);
        height: auto;
        object-fit: contain;
      }

      .playground-imagine-empty-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.15;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-empty-copy {
        margin: 0;
        max-width: 360px;
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-imagine-primary-button,
      .playground-imagine-secondary-button {
        position: relative;
        z-index: 0;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 0;
        border-radius: 999px;
        padding: 0 14px;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-primary-button {
        background: #fff;
        color: #000;
      }

      .playground-imagine-secondary-button {
        color: rgba(255, 255, 255, 0.9);
        background: transparent;
        overflow: hidden;
      }

      .playground-imagine-secondary-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-imagine-secondary-button > * {
        position: relative;
        z-index: 1;
      }

`;
