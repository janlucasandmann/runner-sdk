export const MARKETPLACE_STYLE_FOUNDATION = String.raw`
      .playground-resource-templates-page {
        width: 100%;
        height: 100%;
        min-height: 0;
        border-radius: inherit;
        background: #050505;
        overflow-y: auto;
        box-sizing: border-box;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-resource-templates-page-inner {
        box-sizing: border-box;
        width: min(100%, calc(var(--playground-centered-page-max-width) + 88px));
        max-width: calc(var(--playground-centered-page-max-width) + 88px);
        margin: 0 auto;
        padding: 42px 44px 48px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .playground-resource-templates-hero-heading {
        margin: 0;
        text-align: center;
        font-size: 24px;
        line-height: 1.2;
        font-weight: 500;
        letter-spacing: -0.02em;
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-resource-templates-hero-slide-content {
        width: min(100%, 650px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        text-align: center;
      }

      .playground-resource-templates-hero-pills {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 34px;
      }

      .playground-resource-templates-hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 34px;
        padding: 0 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.86);
        color: #111;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 14px 44px rgba(0, 0, 0, 0.16);
      }

      .playground-resource-templates-hero-pill.is-incoming {
        animation: playground-metronome-hero-pill-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .playground-resource-templates-hero-pill.is-outgoing {
        position: absolute;
        inset: 0 auto auto 50%;
        transform: translateX(-50%);
        animation: playground-metronome-hero-pill-out 260ms cubic-bezier(0.7, 0, 0.84, 0) both;
        pointer-events: none;
      }

      .playground-resource-templates-hero-pill-icon {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.08);
        color: #0d0d0d;
      }

      .playground-resource-templates-hero-copy {
        margin: 0;
        max-width: 560px;
        color: rgba(0, 0, 0, 0.7);
        font-size: 13px;
        line-height: 1.55;
      }

      .playground-resource-templates-hero-cta {
        position: absolute;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        min-height: 32px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: #0d0d0d;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
      }

      .playground-resource-templates-hero-dot {
        width: 8px;
        height: 8px;
        display: block;
        flex: 0 0 auto;
        padding: 0;
        border: 0;
        border-radius: 999px;
        appearance: none;
        background: rgba(255, 255, 255, 0.28);
        transition: background-color 160ms ease, transform 160ms ease;
        cursor: pointer;
      }

      .playground-resource-templates-hero-dot.is-active {
        background: rgba(255, 255, 255, 0.96);
        transform: scale(1.1);
      }

      .playground-resource-templates-notice {
        min-height: 18px;
        color: #66a6ff;
        font-size: 12px;
        line-height: 1.4;
      }

      .marketplace-overview__notice {
        color: #66a6ff;
        font-size: 11px;
        font-weight: 400;
        white-space: nowrap;
      }

      .playground-resource-templates-section-header {
        align-items: flex-start;
      }

      .playground-resource-templates-toolbar {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        flex-wrap: wrap;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-resource-templates-toolbar .playground-plugins-toolbar-controls {
        margin-left: auto;
      }

      .playground-resource-templates-filter-shell .playground-tasks-toolbar-popup-menu {
        left: 0;
        right: auto;
        transform-origin: top left;
      }

`;
