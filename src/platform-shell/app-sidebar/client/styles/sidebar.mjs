export function createAppSidebarFoundationStyles(options = {}) {
  const metronomeSidebarCss = String(options.metronomeSidebarCss || "");
  return `      .playground-shell {
        --playground-shell-sidebar-width: 270px;
        position: relative;
        width: 100vw;
        height: 100vh;
        display: grid;
        grid-template-columns: 270px minmax(0, 1fr);
        background: var(--playground-app-bg);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        transition: grid-template-columns 260ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .playground-shell.sidebar-collapsed {
        --playground-shell-sidebar-width: 64px;
        grid-template-columns: 64px minmax(0, 1fr);
      }

      .playground-sidebar {
        --sidebar-link-color: #fff;
        --sidebar-link-active-color: #fff;
        position: relative;
        z-index: 4;
        display: block;
        min-width: 0;
        height: 100vh;
        padding: 0;
        border-right: 1px solid rgba(255, 255, 255, 0.075);
        overflow: hidden;
        background: #000;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        transition: width 260ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .playground-shell.is-projects-page .playground-sidebar:not(.is-collapsed),
      .playground-shell.is-agents-page .playground-sidebar:not(.is-collapsed) {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      .playground-shell.is-projects-page .playground-sidebar.is-collapsed,
      .playground-shell.is-agents-page .playground-sidebar.is-collapsed {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      .playground-sidebar-panel,
      .playground-sidebar-rail {
        position: absolute;
        inset: 0;
      }

      .playground-sidebar-panel {
        min-width: 0;
        min-height: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 0 10px 0;
        opacity: 1;
        transform: translateX(0);
        visibility: visible;
        pointer-events: auto;
        transition:
          opacity 180ms ease,
          transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
          visibility 0s linear 0s;
      }

      .sidebar-hide-button {
        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--sidebar-link-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .sidebar-hide-button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .sidebar-toggle-icon,
      .sidebar-action-icon,
      .sidebar-search-trigger-icon,
      .sidebar-section-icon,
      .sidebar-settings-icon,
      .sidebar-thread-header-icon,
      .sidebar-rail-icon,
      .sidebar-pin-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        stroke-width: 2;
      }

      .playground-sidebar-top {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 7px;
        min-height: 56px;
        padding: 4px 0;
        margin-bottom: 0;
        box-sizing: border-box;
      }



      .app-sidebar-mode-selector {
        position: relative;
        z-index: 20;
        flex: 0 1 auto;
        min-width: 0;
      }

      .app-sidebar-mode-trigger {
        width: auto;
        min-width: 0;
        height: 34px;
        min-height: 34px;
        padding: 0;
        position: relative;
        z-index: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: #fff;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        cursor: pointer;
        overflow: visible;
        box-shadow: none;
        box-sizing: border-box;
        transition: color 160ms ease;
      }

      .app-sidebar-mode-trigger::before {
        content: none;
        display: none;
      }

      .app-sidebar-mode-trigger > * {
        position: relative;
        z-index: 1;
      }

      .app-sidebar-mode-trigger:hover,
      .app-sidebar-mode-trigger.is-open {
        background: transparent;
        color: #fff;
      }

      .app-sidebar-mode-icon-shell {
        width: 14px;
        height: 14px;
        border-radius: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: inherit;
        flex: 0 0 auto;
      }

      .app-sidebar-mode-icon {
        width: 14px;
        height: 14px;
      }

      .app-sidebar-mode-label {
        min-width: 0;
        flex: 0 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        font-weight: 400;
        color: #fff;
        text-align: left;
      }

      .app-sidebar-mode-trigger-chevron {
        width: 11px;
        height: 11px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.7);
      }





      .app-sidebar-mode-menu {
        position: absolute;
        top: calc(100% + 6px);
        right: auto;
        left: -41px;
        width: 250px;
        min-width: 250px;
        z-index: 120;
        display: flex;
        flex-direction: column;
        gap: 0;
        box-sizing: border-box;
        transform-origin: top left;
      }

      .app-sidebar-mode-option {
        width: 100%;
        padding: 12px 16px;
        border: 0;
        background: transparent;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
        cursor: pointer;
        box-sizing: border-box;
        transition: background-color 160ms ease;
      }

      .app-sidebar-mode-option:hover,
      .app-sidebar-mode-option.is-active {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .app-sidebar-mode-menu .app-sidebar-mode-icon-shell,
      .app-sidebar-mode-menu .app-sidebar-mode-icon {
        width: var(--platform-popup-icon-size, 13px);
        height: var(--platform-popup-icon-size, 13px);
      }

      .app-sidebar-mode-option-copy {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .app-sidebar-mode-option-label {
        font-size: var(--platform-popup-font-size, 12px);
        font-weight: 500;
        line-height: 1.2;
      }

      .app-sidebar-mode-option-description {
        font-size: 11px;
        font-weight: 400;
        line-height: 1.25;
        color: rgba(255, 255, 255, 0.62);
      }

      .app-sidebar-mode-option-check {
        width: 16px;
        height: 16px;
        color: rgba(255, 255, 255, 0.76);
        flex: 0 0 auto;
      }

      .sidebar-search-trigger {
        justify-content: space-between;
        color: var(--sidebar-link-color);
      }

      .sidebar-search-trigger:hover {
        color: var(--sidebar-link-color);
      }

      .sidebar-search-trigger-main {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .sidebar-search-trigger-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      .sidebar-search-trigger-copy {
        font-size: 14px;
        font-weight: 500;
      }

      .sidebar-search-trigger-shortcut {
        display: none;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.52);
        font-size: 10px;
        font-weight: 600;
        line-height: 1;
        letter-spacing: 0.04em;
      }

      .sidebar-search-trigger:hover .sidebar-search-trigger-shortcut,
      .sidebar-search-trigger:focus-visible .sidebar-search-trigger-shortcut,
      .sidebar-search-trigger:focus-within .sidebar-search-trigger-shortcut {
        display: inline;
      }

      .playground-sidebar-brand {
        position: relative;
        flex: 0 0 34px;
        width: 34px;
        height: 34px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--sidebar-link-color);
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        cursor: default;
        overflow: hidden;
        box-sizing: border-box;
      }

      .playground-sidebar-brand-logo {
        position: absolute;
        left: 11.5px;
        top: 50%;
        margin: 0;
        display: block;
        width: 16px;
        height: 16px;
        object-fit: contain;
        transform: translateY(-50%) scale(1);
        transform-origin: center;
        opacity: 1;
        transition: opacity 160ms ease, transform 160ms ease;
      }

      .app-sidebar-top-actions {
        flex: 0 0 auto;
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .app-sidebar-top-action {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: 5px;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 160ms ease, background-color 160ms ease;
      }

      .app-sidebar-top-action.platform-icon-button {
        border-radius: 5px !important;
      }

      .app-sidebar-top-action:hover,
      .app-sidebar-top-action:focus-visible {
        background: rgba(255, 255, 255, 0.075);
        color: #fff;
        outline: none;
      }

      .app-sidebar-top-action-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
      }

      .playground-sidebar-rail {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        padding: 0 10px 0;
        opacity: 0;
        transform: translateX(-12px);
        visibility: hidden;
        pointer-events: none;
        transition:
          opacity 180ms ease,
          transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
          visibility 0s linear 180ms;
      }

      .sidebar-rail-top {
        width: 100%;
        min-height: 56px;
        padding: 4px 0 4px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }

      .playground-sidebar.is-collapsed .playground-sidebar-panel {
        opacity: 0;
        transform: translateX(-18px);
        visibility: hidden;
        pointer-events: none;
        transition-delay: 0s, 0s, 180ms;
      }

      .playground-sidebar.is-collapsed .playground-sidebar-rail {
        opacity: 1;
        transform: translateX(0);
        visibility: visible;
        pointer-events: auto;
        transition-delay: 0s, 0s, 0s;
      }

      .sidebar-rail-logo-button,
      .sidebar-rail-button {
        width: 34px;
        height: 34px;
        margin-left: 4px;
        padding: 0;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--sidebar-link-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-sizing: border-box;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .sidebar-rail-logo-button {
        width: 34px;
        height: 34px;
        margin-left: 2px;
      }

      .sidebar-rail-logo-button {
        color: var(--sidebar-link-color);
      }

      .sidebar-rail-logo-button {
        position: relative;
        overflow: hidden;
      }

      .sidebar-rail-logo-button:hover {
        background: transparent;
        color: var(--sidebar-link-active-color);
      }

      .sidebar-rail-button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--sidebar-link-active-color);
      }

      .sidebar-rail-logo {
        position: absolute;
        left: 12px;
        top: 50%;
        margin: 0;
        display: block;
        width: 16px;
        height: 16px;
        object-fit: contain;
        transform: translateY(-50%) scale(1);
        transform-origin: center;
        opacity: 1;
        transition: opacity 160ms ease, transform 160ms ease;
      }

      .sidebar-rail-logo-open-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        margin: 0;
        width: 14px;
        height: 14px;
        transform: translateY(-50%) scale(0.9);
        transform-origin: center;
        opacity: 0;
        transition: opacity 160ms ease, transform 160ms ease;
      }

      .sidebar-rail-logo-button:hover .sidebar-rail-logo,
      .sidebar-rail-logo-button:focus-visible .sidebar-rail-logo {
        opacity: 0;
        transform: translateY(-50%) scale(0.9);
      }

      .sidebar-rail-logo-button:hover .sidebar-rail-logo-open-icon,
      .sidebar-rail-logo-button:focus-visible .sidebar-rail-logo-open-icon {
        opacity: 1;
        transform: translateY(-50%) scale(1);
      }

      .sidebar-rail-actions {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
      }

      .sidebar-rail-section-spacer {
        width: 100%;
        height: 8px;
        flex: 0 0 8px;
        pointer-events: none;
      }

      .sidebar-rail-footer {
        margin-top: auto;
        padding-bottom: 10px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
      }

      .sidebar-rail-button.is-active {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        color: var(--sidebar-link-active-color);
      }

      .sidebar-rail-account {
        width: 34px;
        height: 34px;
        margin-top: 0;
        margin-bottom: 0;
        margin-left: 4px;
        padding: 0;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--sidebar-link-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-sizing: border-box;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .sidebar-rail-account:hover,
      .sidebar-rail-account.is-open {
        background: rgba(255, 255, 255, 0.08);
        color: var(--sidebar-link-active-color);
      }

      .sidebar-rail-account-image,
      .sidebar-account-avatar-image,
      .account-menu-avatar-image,
      .profile-editor-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .sidebar-action-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 20px;
      }

      .sidebar-action-subtitle,
      .sidebar-thread-section-title {
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        text-transform: none;
        letter-spacing: 0;
      }

      .sidebar-action-subtitle {
        width: 100%;
        margin: 8px 0 4px;
        padding: 0 12px;
        box-sizing: border-box;
      }

      .sidebar-action-button,
      .sidebar-settings-button {
        width: 100%;
        min-height: 34px;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 12px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--sidebar-link-color);
        cursor: pointer;
        text-align: left;
        font-size: 12px;
        line-height: 14px;
        font-weight: 500;
        box-sizing: border-box;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .sidebar-action-button:hover,
      .sidebar-settings-button:hover {
        background: rgba(255, 255, 255, 0.07);
      }

      .sidebar-action-button.is-active {
        background: rgba(255, 255, 255, 0.08);
        color: var(--sidebar-link-active-color);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .sidebar-settings-button.is-active {
        color: var(--sidebar-link-active-color);
      }

      .sidebar-pinned-list,
      .sidebar-thread-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .sidebar-pinned-list {
        margin-bottom: 18px;
      }

      .sidebar-pinned-button,
      .sidebar-thread-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        padding-right: 64px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--sidebar-link-color);
        text-align: left;
        position: relative;
        transition: background-color 160ms ease;
      }

      .sidebar-pinned-button:hover,
      .sidebar-thread-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .sidebar-pinned-button.is-active,
      .sidebar-thread-item.is-active {
        background: rgba(255, 255, 255, 0.08);
        color: var(--sidebar-link-active-color);
      }

${metronomeSidebarCss}

      .sidebar-thread-main {
        min-width: 0;
        flex: 1;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        display: flex;
        align-items: center;
        cursor: pointer;
        text-align: left;
      }

      .sidebar-pin-icon {
        color: var(--sidebar-link-color);
      }

      .sidebar-thread-content {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: center;
        min-height: 14px;
        padding-right: 6px;
      }

      .sidebar-thread-title-row {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .sidebar-thread-title-copy {
        min-width: 0;
        flex: 1;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        overflow: hidden;
      }

      .sidebar-thread-project-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        color: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .sidebar-thread-project-icon.is-mission-control {
        background: linear-gradient(180deg, #3159a8 0%, #172f68 100%);
        box-shadow: inset 0 0 0 1px rgba(137, 178, 255, 0.16), 0 1px 2px rgba(0, 0, 0, 0.28);
        border-radius: 5px;
        color: #fff;
      }

      .sidebar-thread-project-icon svg {
        width: 10px;
        height: 10px;
      }

      .sidebar-thread-title {
        min-width: 0;
        flex: 1;
        font-size: 12px;
        font-weight: 400;
        color: var(--sidebar-link-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sidebar-pinned-button.is-active .sidebar-thread-title,
      .sidebar-thread-item.is-active .sidebar-thread-title {
        color: var(--sidebar-link-active-color);
      }

      .sidebar-thread-ticket-number {
        flex-shrink: 0;
        font-size: 12px;
        color: inherit;
      }

      .sidebar-thread-running-indicator {
        width: 12px;
        height: 12px;
        flex-shrink: 0;
        display: block;
        object-fit: contain;
        animation: spinner-rotate 1s linear infinite;
      }

      .sidebar-thread-attention-dot {
        width: 7px;
        height: 7px;
        flex: 0 0 7px;
        border-radius: 999px;
        background: #60a5fa;
        box-shadow: 0 0 0 2px #0b0b0c;
      }

      .sidebar-thread-side {
        position: absolute;
        top: 50%;
        right: 8px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-width: 24px;
        max-width: 96px;
        height: 24px;
        padding-right: 28px;
        transform: translateY(-50%);
      }

      .sidebar-thread-meta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        white-space: nowrap;
        line-height: 1;
        transition: opacity 160ms ease;
      }

      .sidebar-thread-hover-meta {
        position: absolute;
        top: 50%;
        right: 28px;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.72);
        font-size: 10px;
        font-weight: 400;
        letter-spacing: 0.02em;
        line-height: 1;
        white-space: nowrap;
        margin-right: -3px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 160ms ease;
      }

      .sidebar-thread-menu-button {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        padding: 0;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--sidebar-link-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        opacity: 0;
        pointer-events: none;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .sidebar-thread-menu-button:hover,
      .sidebar-thread-menu-button.is-open {
        background: rgba(255, 255, 255, 0.05);
        color: var(--sidebar-link-active-color);
      }

      .sidebar-pinned-button:hover .sidebar-thread-menu-button,
      .sidebar-thread-item:hover .sidebar-thread-menu-button,
      .sidebar-pinned-button:focus-within .sidebar-thread-menu-button,
      .sidebar-thread-item:focus-within .sidebar-thread-menu-button,
      .sidebar-pinned-button.is-active .sidebar-thread-menu-button,
      .sidebar-thread-item.is-active .sidebar-thread-menu-button,
      .sidebar-thread-menu-button.is-open {
        opacity: 1;
        pointer-events: auto;
      }

      .sidebar-pinned-button:hover .sidebar-thread-meta,
      .sidebar-thread-item:hover .sidebar-thread-meta,
      .sidebar-pinned-button:focus-within .sidebar-thread-meta,
      .sidebar-thread-item:focus-within .sidebar-thread-meta,
      .sidebar-pinned-button.is-active .sidebar-thread-meta,
      .sidebar-thread-item.is-active .sidebar-thread-meta {
        opacity: 0;
        pointer-events: none;
      }

      .sidebar-pinned-button:hover .sidebar-thread-hover-meta,
      .sidebar-thread-item:hover .sidebar-thread-hover-meta,
      .sidebar-pinned-button:focus-within .sidebar-thread-hover-meta,
      .sidebar-thread-item:focus-within .sidebar-thread-hover-meta,
      .sidebar-pinned-button.is-active .sidebar-thread-hover-meta,
      .sidebar-thread-item.is-active .sidebar-thread-hover-meta {
        opacity: 1;
      }

      .sidebar-thread-menu-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      .sidebar-thread-menu-icon.is-spinning {
        animation: spinner-rotate 1s linear infinite;
      }

      .sidebar-thread-meta-positive {
        color: #34d67a;
        font-size: 12px;
        font-weight: 600;
      }

      .sidebar-thread-meta-negative {
        color: #ff5f57;
        font-size: 12px;
        font-weight: 600;
      }

      .sidebar-thread-meta-neutral {
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        font-weight: 500;
      }

      .sidebar-thread-section {
        min-height: 0;
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .sidebar-thread-section-header {
        width: 100%;
        padding: 0 12px;
        border: 0;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
        cursor: pointer;
      }

      .sidebar-thread-section-title {
        padding: 0;
      }

      .sidebar-thread-section-chevron {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        margin-right: 2px;
        color: rgba(255, 255, 255, 0.5);
        transition: transform 160ms ease, color 160ms ease;
      }

      .sidebar-action-icon,
      .sidebar-search-trigger-icon,
      .sidebar-rail-icon {
        stroke-width: 1.5;
      }

      .sidebar-thread-section-header.is-collapsed .sidebar-thread-section-chevron {
        transform: rotate(180deg);
      }

      .sidebar-thread-section-header:hover .sidebar-thread-section-chevron {
        color: rgba(255, 255, 255, 0.5);
      }

      .sidebar-thread-popup-scrim,
      .sidebar-thread-rename-scrim {
        position: fixed;
        inset: 0;
        z-index: 120;
      }

      .sidebar-thread-popup {
        position: fixed;
        z-index: 121;
        width: 240px;
      }

      .sidebar-thread-popup.is-agent-list-action-menu {
        transform-origin: top right;
        animation: playground-tasks-toolbar-popup-fade-down-in 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .sidebar-thread-popup.is-agent-list-action-menu.is-closing {
        pointer-events: none;
        animation: playground-agent-list-action-menu-fade-out 90ms ease both;
      }

      .sidebar-thread-popup-title {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.2;
      }

      .sidebar-thread-popup-row {
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

      .sidebar-thread-popup-row:hover:enabled {
        background: transparent;
      }

      .sidebar-thread-popup-row.is-danger {
        color: #ff9c9c;
      }

      .sidebar-thread-popup-row:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .sidebar-thread-popup-row-icon {
        width: var(--platform-popup-icon-size, 13px);
        height: var(--platform-popup-icon-size, 13px);
        flex-shrink: 0;
      }

      .sidebar-thread-popup-row-label {
        min-width: 0;
        flex: 1;
        font-size: inherit;
        font-weight: 400;
        line-height: inherit;
      }

      @keyframes playground-agent-list-action-menu-fade-out {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        to {
          opacity: 0;
          transform: translateY(-4px) scale(0.98);
        }
      }

      .sidebar-thread-rename-scrim {
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      .sidebar-thread-rename-modal {
        width: min(340px, 100%);
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: #323232;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);
        backdrop-filter: blur(10px);
      }

      .sidebar-thread-rename-title {
        color: rgba(255, 255, 255, 0.96);
        font-size: 16px;
        font-weight: 600;
        line-height: 1.2;
      }

      .sidebar-thread-rename-copy {
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.45;
      }

      .sidebar-thread-rename-input {
        width: 100%;
        height: 40px;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        font-size: 14px;
        outline: none;
      }

      .sidebar-thread-rename-input:focus {
        border-color: rgba(77, 163, 255, 0.6);
      }

      .sidebar-thread-rename-error {
        color: #ff9c9c;
        font-size: 12px;
        line-height: 1.4;
      }

      .sidebar-thread-rename-actions {
        display: flex;
        gap: 10px;
      }

      .sidebar-thread-rename-button {
        flex: 1;
        height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 12px;
        border: 0;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 160ms ease, background-color 160ms ease, color 160ms ease;
      }

      .sidebar-thread-rename-button:hover:enabled {
        opacity: 0.88;
      }

      .sidebar-thread-rename-button:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .sidebar-thread-rename-button.is-secondary {
        background: transparent;
        color: white;
      }

      .sidebar-thread-rename-button.is-primary {
        background: white;
        color: black;
      }

      .sidebar-thread-project-picker-modal {
        width: min(420px, 100%);
      }

      .sidebar-thread-project-picker-modal .sidebar-thread-rename-button {
        font-size: 12px;
      }

      .sidebar-thread-project-picker-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: min(52vh, 360px);
        overflow: auto;
        padding-right: 2px;
      }

      .sidebar-thread-project-picker-row {
        width: 100%;
        border: 0;
        background: transparent;
        padding: 0;
        text-align: left;
        cursor: pointer;
      }

      .sidebar-thread-project-picker-row .playground-tasks-project-row {
        transition: border-color 160ms ease, background-color 160ms ease;
      }

      .sidebar-thread-project-picker-row:hover .playground-tasks-project-row,
      .sidebar-thread-project-picker-row.is-selected .playground-tasks-project-row {
        border-color: rgba(102, 166, 255, 0.45);
        background: rgba(102, 166, 255, 0.09);
      }

      .sidebar-thread-project-picker-row:disabled {
        cursor: default;
        opacity: 0.55;
      }

      .sidebar-thread-project-picker-empty {
        padding: 16px 0 6px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-thread-home-project-picker-scrim {
        background: rgba(0, 0, 0, 0.28);
      }

      .playground-thread-home-project-picker-modal {
        width: min(280px, calc(100vw - 32px));
        max-height: min(320px, calc(100vh - 64px));
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 0;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: #323232;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .playground-thread-home-project-picker-title {
        padding: 12px 16px 0;
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.2;
      }

      .playground-thread-home-project-picker-body {
        flex: 1;
        min-height: 0;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .playground-thread-home-project-picker-body::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }

      .playground-thread-home-project-picker-row {
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

      .playground-thread-home-project-picker-row:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-thread-home-project-picker-icon {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.6);
      }

      .playground-thread-home-project-picker-row.is-selected .playground-thread-home-project-picker-icon,
      .playground-thread-home-project-picker-row.is-selected .playground-thread-home-project-picker-label,
      .playground-thread-home-project-picker-row.is-selected .playground-thread-home-project-picker-check {
        color: white;
      }

      .playground-thread-home-project-picker-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        font-weight: 500;
        color: white;
      }

      .playground-thread-home-project-picker-check-slot {
        width: 16px;
        height: 16px;
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .playground-thread-home-project-picker-check {
        width: 16px;
        height: 16px;
        color: white;
      }

      .playground-thread-home-project-picker-empty,
      .playground-thread-home-project-picker-loading {
        padding: 0 16px 12px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-thread-home-project-picker-loading {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-thread-home-project-picker-spinner {
        width: 14px;
        height: 14px;
        border-radius: 999px;
        border: 1.5px solid rgba(255, 255, 255, 0.16);
        border-top-color: rgba(255, 255, 255, 0.7);
        animation: spin 700ms linear infinite;
      }

      .playground-thread-home-project-picker-error {
        padding: 0 16px 12px;
        color: #ff9c9c;
        font-size: 12px;
        line-height: 1.4;
      }

      .sidebar-thread-section-actions {
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }

      .sidebar-thread-section-button {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--sidebar-link-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .sidebar-thread-section-button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .sidebar-thread-scroll {
        min-height: 0;
        overflow: auto;
        padding-right: 2px;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .sidebar-thread-scroll::-webkit-scrollbar {
        display: none;
      }

      .sidebar-empty-state {
        padding: 10px 12px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.45;
      }

      .sidebar-show-more {
        margin: 8px 0 0 10px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
      }

      .sidebar-show-more:hover {
        color: rgba(255, 255, 255, 0.8);
      }

      .sidebar-footer {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: auto;
        padding: 12px 0;
      }

      .sidebar-footer .status-indicator-stack {
        margin-top: 0;
      }

      .sidebar-footer .status-indicator-list,
      .sidebar-footer .status-indicator {
        width: 100%;
        box-sizing: border-box;
      }

      .sidebar-account-button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        cursor: pointer;
        text-align: left;
        transition: opacity 160ms ease;
      }

      .sidebar-account-button:hover {
        opacity: 0.9;
      }

      .sidebar-account-avatar,
      .account-menu-avatar {
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .sidebar-account-avatar {
        width: 24px;
        height: 24px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .sidebar-account-avatar-fallback,
      .account-menu-avatar-fallback {
        width: 100%;
        height: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        font-weight: 400;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .sidebar-account-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1px;
      }

      .sidebar-account-name {
        width: 100%;
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sidebar-account-tier {
        font-size: 11px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.64);
      }

      .sidebar-plan-card {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: 0 0 5px;
        color: rgba(255, 255, 255, 0.94);
        box-sizing: border-box;
      }

      .sidebar-plan-name {
        font-family: Georgia, "Times New Roman", serif;
        font-style: italic;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.2;
        color: rgba(255, 255, 255, 0.72);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sidebar-plan-action {
        --sidebar-plan-action-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        width: 100%;
        height: 30px;
        min-height: 30px;
        padding: 0 12px;
        position: relative;
        z-index: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        overflow: hidden;
        box-sizing: border-box;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease;
      }

      .sidebar-plan-action::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--sidebar-plan-action-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .sidebar-plan-action > * {
        position: relative;
        z-index: 1;
      }

      .sidebar-plan-action:hover {
        background: rgba(255, 255, 255, 0.04);
        color: #fff;
      }

      .sidebar-plan-action.is-upgrade {
        background: #fff;
        color: #000;
      }

      .sidebar-plan-action.is-upgrade:hover {
        background: rgba(255, 255, 255, 0.9);
        color: #000;
      }

      .sidebar-plan-action:disabled {
        cursor: default;
        opacity: 0.58;
      }

      .sidebar-organization-card {
        width: 100%;
        min-width: 0;
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr) 28px;
        align-items: center;
        gap: 8px;
        padding: 4px 0 4px 12px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        box-sizing: border-box;
        cursor: pointer;
        text-align: left;
        transition: background-color 160ms ease;
      }

      .sidebar-organization-card:focus-visible {
        outline: 1px solid rgba(255, 255, 255, 0.28);
        outline-offset: -1px;
      }

      .sidebar-organization-main {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        text-align: left;
      }

      .sidebar-organization-avatar {
        position: relative;
        overflow: hidden;
        width: 30px;
        height: 30px;
        flex: 0 0 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
      }

      .sidebar-organization-avatar-image {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .sidebar-organization-avatar-fallback {
        width: 100%;
        height: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .sidebar-organization-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .sidebar-organization-name,
      .sidebar-organization-plan {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sidebar-organization-name {
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.2;
      }

      .sidebar-organization-plan {
        color: rgba(255, 255, 255, 0.62);
        font-size: 10px;
        font-weight: 400;
        line-height: 1.2;
      }

      .sidebar-organization-menu-button {
        width: 28px;
        height: 28px;
        min-width: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.58);
        pointer-events: none;
        transition: color 160ms ease, background-color 160ms ease;
      }

      .sidebar-organization-card:hover .sidebar-organization-menu-button,
      .sidebar-organization-card.is-open .sidebar-organization-menu-button {
        color: rgba(255, 255, 255, 0.94);
        background: rgba(255, 255, 255, 0.06);
      }

      .sidebar-organization-menu-icon {
        width: 16px;
        height: 16px;
      }

`;
}
