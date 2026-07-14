export const IMAGINE_PAGE_FOUNDATION_CSS = String.raw`
      .playground-content-body.is-imagine-page {
        padding: 0;
        overflow: hidden;
      }

      .playground-imagine-page {
        position: relative;
        isolation: isolate;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        background: #000;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-page::after {
        display: none;
      }

      .playground-imagine-shell {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: none;
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .playground-imagine-header {
        display: none;
      }

      .playground-imagine-title-row,
      .playground-imagine-content-navbar {
        width: 100%;
        min-height: 34px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-imagine-navbar-left,
      .playground-imagine-navbar-right {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-imagine-navbar-left {
        flex: 0 0 auto;
      }

      .playground-imagine-navbar-right {
        flex: 0 0 auto;
        margin-left: auto;
      }

      .playground-imagine-template-count {
        display: none;
      }

      .playground-imagine-title-group {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-imagine-title {
        margin: 0;
        font-size: 18px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: -0.03em;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-imagine-beta {
        display: none;
        align-items: center;
        justify-content: center;
        height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.9);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-imagine-tabs {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        flex: 0 0 auto;
        padding: 2px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        line-height: 1rem;
        overflow: hidden;
      }

      .playground-imagine-tabs::before {
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

      .playground-imagine-tab {
        position: relative;
        z-index: 1;
        min-width: 76px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        padding: 0 12px;
        font-size: 12px;
        line-height: 1rem;
        font-weight: 400;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease;
      }

      .playground-imagine-tab.is-active {
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
      }

      .playground-imagine-media-switch {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        height: 28px;
        padding: 1px !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 999px;
        background: transparent;
        overflow: hidden;
      }

      .playground-imagine-media-switch::before {
        content: none !important;
        display: none !important;
      }

      .playground-imagine-media-switch-button {
        position: relative;
        z-index: 1;
        height: 24px;
        min-width: 46px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        padding: 0 10px;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-media-switch-button.is-active {
        background: rgba(255, 255, 255, 0.2) !important;
        color: #fff;
      }

      .tb-runner-chat .tb-composer-leading-control .playground-imagine-media-switch {
        margin-left: -10px !important;
        margin-right: 0 !important;
      }

      .playground-imagine-model-selector .tb-inline-selector {
        max-width: 190px;
        min-height: 32px;
      }

      .playground-imagine-model-selector-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-imagine-model-menu {
        width: 300px !important;
        -webkit-backdrop-filter: blur(5px) !important;
        backdrop-filter: blur(5px) !important;
      }

      .playground-imagine-model-menu-body {
        flex: 1;
        min-height: 0;
        max-height: 168px;
        overflow-y: auto;
        padding-top: 4px;
        padding-bottom: 4px;
        border-top: 0;
      }

      .playground-imagine-model-menu .tb-popup-row {
        align-items: center;
        gap: 10px;
        min-height: 42px;
      }

      .playground-imagine-model-provider-icon-shell {
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.8);
      }

      .playground-imagine-model-provider-icon-shell .playground-agents-model-provider-icon {
        width: 16px;
        height: 16px;
      }

      .playground-imagine-model-selector-icon {
        width: 16px;
        height: 16px;
      }

      .playground-imagine-model-option-copy {
        min-width: 0;
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        text-align: left;
      }

      .playground-imagine-model-option-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-imagine-toolbar.playground-auth-users-toolbar {
        flex: 0 0 auto;
        margin: 0;
        padding: 0;
        border-bottom: 0;
      }

      .playground-imagine-toolbar .playground-auth-users-search,
      .playground-imagine-content-navbar .playground-auth-users-search {
        max-width: none;
        flex: 1 1 auto;
      }

      .playground-imagine-toolbar .playground-auth-users-search-input,
      .playground-imagine-content-navbar .playground-auth-users-search-input {
        height: 30px;
        font-size: 12px;
      }

      .playground-imagine-toolbar .playground-files-control-button,
      .playground-imagine-content-navbar .playground-files-control-button {
        min-height: 30px;
        height: 30px;
        padding: 0 14px;
        font-size: 12px;
        font-weight: 400;
      }

      .playground-imagine-content-navbar .playground-files-control-button.is-backlog-filter,
      .playground-imagine-content-navbar .playground-files-control-button.is-backlog-sort {
        padding-right: 14px;
      }

      .playground-imagine-content-navbar .playground-files-control-button {
        --playground-files-control-button-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        overflow: hidden;
        border: 0;
        background: transparent;
      }

      .playground-imagine-content-navbar .playground-files-control-button::before {
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

      .playground-imagine-content-navbar .playground-files-control-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-toolbar .playground-files-control-button svg,
      .playground-imagine-content-navbar .playground-files-control-button svg {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-imagine-toolbar .playground-tasks-toolbar-popup-shell,
      .playground-imagine-content-navbar .playground-tasks-toolbar-popup-shell {
        position: relative;
      }

      .playground-imagine-toolbar .playground-tasks-toolbar-popup-menu,
      .playground-imagine-content-navbar .playground-tasks-toolbar-popup-menu {
        left: auto;
        right: 0;
        top: calc(100% + 8px);
        min-width: 210px;
      }

      .playground-imagine-navbar-left .playground-tasks-toolbar-popup-menu {
        left: 0;
        right: auto;
      }

`;
