export const FILES_TOOLBAR_CSS = `
      .playground-files-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: var(--playground-files-nav-row-height);
        gap: 16px;
        position: relative;
        z-index: 31;
      }

      .playground-files-page .playground-files-topbar {
        display: none;
      }

      .playground-files-unified-navbar {
        position: relative;
        z-index: 10040;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page) > .playground-content-nav {
        position: relative;
        z-index: 10030;
        overflow: visible;
      }

      .playground-files-unified-navbar .playground-files-environment-select-shell {
        position: relative;
        z-index: 10041;
        min-height: 0;
        max-width: 320px;
      }

      .playground-files-unified-navbar .playground-files-inline-selector {
        min-height: 30px;
        font-size: 12px;
      }

      .playground-files-unified-navbar .playground-files-header-icon-button.is-plain {
        width: 28px;
        height: 28px;
      }

      .playground-files-topbar-actions {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        min-height: var(--playground-files-nav-row-height);
        gap: 6px;
      }

      .playground-files-toolbar-anchor {
        position: relative;
        z-index: 321;
      }

      .playground-files-environment-select-shell {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: var(--playground-files-nav-row-height);
        min-width: 0;
        max-width: 320px;
      }

      .playground-files-inline-selector {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 32px;
        padding: 0;
        border: 0;
        background: transparent;
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: color 160ms ease;
      }

      .playground-files-inline-selector:hover {
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-files-inline-selector:disabled {
        opacity: 0.5;
        cursor: default;
      }

      .playground-files-inline-selector-chevron,
      .playground-files-environment-menu-check {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .playground-files-inline-selector-chevron {
        transition: transform 160ms ease;
      }

      .playground-files-inline-selector.active .playground-files-inline-selector-chevron {
        transform: rotate(180deg);
      }

      .playground-files-environment-menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        z-index: 10042;
        width: 240px;
        max-height: 284px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .playground-files-environment-scope-menu {
        width: 336px;
        max-height: 420px;
      }

      .playground-files-environment-menu-switch {
        width: calc(100% - 24px);
        margin: 10px 12px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 34px;
        height: 34px;
        padding: 2px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        overflow: hidden;
        transform: none;
        position: relative;
        box-sizing: border-box;
      }

      .playground-files-environment-menu-switch::before {
        display: none;
      }

      .playground-files-environment-menu-switch-button {
        appearance: none;
        border: 0;
        flex: 1;
        min-width: 0;
        min-height: 0;
        height: 28px;
        padding: 4px 12px;
        border-radius: 999px;
        background: transparent;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        text-align: center;
        color: rgba(255, 255, 255, 0.72);
        cursor: pointer;
      }

      .playground-files-environment-menu-switch-button.is-active {
        background: rgba(255, 255, 255, 0.35);
        color: #fff;
      }

      .playground-files-environment-menu-switch-button:disabled {
        cursor: default;
        opacity: 0.55;
      }

      .playground-files-environment-menu-empty {
        padding: 14px 16px 16px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-files-environment-actions-menu {
        width: 280px;
        max-height: none;
      }

      .playground-files-environment-actions-menu .playground-files-environment-menu-body {
        overflow: visible;
      }

      .playground-files-environment-menu-title {
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.2;
      }

      .playground-files-environment-menu-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }

      .playground-files-environment-menu-footer {
        flex-shrink: 0;
        padding: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-files-environment-create-button {
        width: 100%;
        min-height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: background-color 160ms ease;
      }

      .playground-files-environment-create-button:hover {
        background: rgba(255, 255, 255, 0.14);
      }

      .playground-files-environment-menu-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 0;
        background: transparent;
        color: white;
        cursor: pointer;
        text-align: left;
        transition: background-color 160ms ease;
      }

      .playground-files-environment-menu-row:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-files-environment-menu-row.selected {
        background: transparent;
      }

      .playground-files-environment-menu-label {
        min-width: 0;
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: white;
      }

      .playground-files-environment-menu-check-slot {
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-left: auto;
      }

      .playground-files-environment-menu-check {
        color: white;
      }

      .playground-files-environment-action-row {
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 16px;
        border: 0;
        background: transparent;
        color: white;
        cursor: pointer;
        text-align: left;
        transition: background-color 160ms ease, opacity 160ms ease;
      }

      .playground-files-environment-action-row:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-files-environment-action-row:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .playground-files-environment-action-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .playground-files-environment-action-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-files-environment-action-copy span:first-child {
        font-size: 12px;
        font-weight: 500;
        color: white;
      }

      .playground-files-environment-action-copy span + span {
        font-size: 12px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-files-environment-action-divider {
        height: 1px;
        margin: 4px 16px;
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-files-header-icon-button {
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
      }

      .playground-files-header-icon-button:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.18);
        color: #fff;
      }

      .playground-files-header-icon-button.is-active {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .playground-files-header-icon-button.is-plain {
        width: 30px;
        height: 30px;
        border-color: transparent;
        border-radius: 10px;
      }

      .playground-files-header-icon-button.is-plain:hover {
        border-color: transparent;
      }

      .playground-files-header-icon-button:disabled {
        opacity: 0.34;
        cursor: default;
      }

      .playground-files-control-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: nowrap;
        min-width: 0;
        position: relative;
        z-index: 322;
      }

      .playground-files-control-actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
        min-width: 0;
      }

      .playground-files-control-button {
        height: 30px;
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 14px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        background: transparent;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px !important;
        font-weight: 400 !important;
        cursor: pointer;
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
      }

      .playground-files-control-button:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.16);
      }

      .playground-files-control-button.is-active {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        color: #fff;
      }

      .playground-files-control-button.is-bare {
        border-color: transparent;
        background: transparent;
        box-shadow: none;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-files-control-button.is-bare:hover,
      .playground-files-control-button.is-bare.is-active {
        background: transparent;
        border-color: transparent;
      }

      .playground-files-control-button.is-backlog-filter {
        padding-right: 0;
      }

      .playground-files-page .playground-files-control-row .playground-files-control-button {
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

      .playground-files-page .playground-files-control-row .playground-files-control-button::before {
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

      .playground-files-page .playground-files-control-row .playground-files-control-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-files-page .playground-files-control-row .playground-files-control-button:hover,
      .playground-files-page .playground-files-control-row .playground-files-control-button.is-active {
        border-color: transparent;
      }

      .playground-files-control-spacer {
        flex: 1 1 auto;
        min-width: 0;
      }

      .playground-files-control-create {
        flex: 0 0 auto;
      }

      .playground-files-toolbar-menu-align-right {
        left: auto;
        right: 0;
      }

      .playground-files-path-strip {
        min-width: 0;
        flex: 0 1 auto;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
      }

      .playground-files-browser-nav {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: 0 0 auto;
      }

      .playground-files-nav-button {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.6);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-files-nav-button:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
      }

      .playground-files-nav-button:disabled {
        opacity: 0.34;
        cursor: default;
      }

      .playground-files-breadcrumbs {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        overflow: hidden;
        font-size: 12px;
        white-space: nowrap;
        justify-content: flex-end;
      }

      .playground-files-breadcrumb-icon {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        display: block;
        object-fit: contain;
      }

      .playground-files-breadcrumb {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        cursor: pointer;
      }

      .playground-files-breadcrumb:hover {
        color: #fff;
      }

      .playground-files-breadcrumb.is-active {
        cursor: default;
      }

      .playground-files-breadcrumb-separator {
        color: rgba(255, 255, 255, 0.24);
      }

      .playground-files-browser-summary {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        margin-left: 10px;
      }

      .playground-files-toolbar-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 240px;
        z-index: 340;
      }

      .playground-files-floating-menu {
        overflow: hidden;
        transform-origin: top right;
        z-index: 10080;
      }

      .playground-files-create-menu {
        width: min(248px, calc(100vw - 24px));
      }

      .playground-files-floating-menu.account-menu-animate-up-in,
      .playground-files-floating-menu.account-menu-animate-up-out {
        transform-origin: top right;
      }

      .playground-files-floating-menu .playground-files-toolbar-menu-item {
        min-height: 58px;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 0;
      }

      .playground-files-floating-menu .playground-files-toolbar-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-files-floating-menu .playground-files-toolbar-menu-item svg {
        width: 16px;
        height: 16px;
        margin-top: 2px;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-files-floating-menu .playground-files-toolbar-menu-item-copy {
        gap: 5px;
      }

      .playground-files-floating-menu .playground-files-toolbar-menu-item-copy span:first-child {
        font-size: 14px;
        font-weight: 500;
        color: #fff;
      }

      .playground-files-floating-menu .playground-files-toolbar-menu-item-copy span + span {
        font-size: 12px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-files-toolbar-menu-wide {
        left: 0;
        right: auto;
        width: 260px;
      }

      .playground-files-toolbar-menu-wide.playground-files-toolbar-menu-align-right {
        left: auto;
        right: 0;
      }

      .playground-files-toolbar-menu-title {
        padding: 6px 12px 8px;
        font-size: 11px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-files-toolbar-menu-section-label {
        padding: 8px 12px 6px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.38);
      }

      .playground-files-toolbar-menu-divider {
        height: 1px;
        margin: 6px 8px;
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-files-toolbar-menu-item {
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 12px;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-files-toolbar-menu-item:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-files-toolbar-menu-item.is-active {
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-files-toolbar-menu-item:disabled {
        opacity: 0.44;
        cursor: default;
      }

      .playground-files-toolbar-menu-item-copy {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-files-toolbar-menu-item-copy span:first-child {
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-files-toolbar-menu-item-copy span + span {
        font-size: 11px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-files-toolbar-menu-check {
        width: 12px;
        flex-shrink: 0;
        padding-top: 1px;
        color: rgba(255, 255, 255, 0.78);
        font-size: 16px;
        line-height: 1;
        text-align: center;
      }
`;
