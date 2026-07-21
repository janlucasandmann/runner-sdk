export const GUARDRAILS_PAGE_FOUNDATION_CSS = `      .playground-guardrails-page {
        height: 100%;
        min-height: 0;
        background: transparent;
      }

      .playground-guardrails-library-tabs .playground-files-library-tab {
        min-width: 94px;
      }

      .playground-guardrails-toolbar-menu {
        z-index: 10090;
      }

      .playground-guardrails-detail-topnav-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-guardrails-detail-publish-controls {
        display: inline-flex;
        align-items: center;
      }

      .playground-guardrails-action-menu-shell {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-guardrails-row-action-menu-shell {
        width: 28px;
        height: 28px;
        justify-self: start;
      }

      .playground-guardrails-action-menu-shell .playground-guardrails-action-menu {
        top: calc(100% + 8px);
        right: 0;
        left: auto;
        width: 180px;
        min-width: 180px;
        max-height: min(220px, calc(100vh - 120px));
        transform-origin: top right;
      }

      .playground-guardrails-detail-action-menu-shell .playground-guardrails-action-menu {
        width: 260px;
        min-width: 260px;
      }

      .playground-guardrails-action-menu .tb-popup-row.is-danger,
      .playground-guardrails-action-menu .tb-popup-row.is-danger .tb-popup-icon,
      .playground-guardrails-action-menu .tb-popup-row.is-danger .playground-tasks-toolbar-popup-item-copy span:first-child {
        color: #ff6b6b;
      }

      .playground-guardrails-browser {
        overflow: hidden;
      }

      .playground-guardrails-shell.has-guardrail-versions {
        grid-template-columns: minmax(0, 1fr) minmax(320px, 360px) 0;
        gap: 12px;
      }

      .playground-guardrails-versions-sidebar {
        min-width: 0;
        width: 100%;
      }

      .playground-files-page .playground-guardrails-browser-body {
        display: flex;
        flex-direction: column;
        padding-bottom: 24px;
        overflow: hidden;
      }

`;
