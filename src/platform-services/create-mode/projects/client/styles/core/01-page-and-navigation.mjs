export const PROJECTS_CORE_CSS_01_FRAGMENT = `
      .playground-tasks-page {
        height: 100%;
        min-height: 0;
      }

      .playground-tasks-page.is-inline-detail {
        width: 100%;
        height: 100%;
      }

      .playground-thread-detail-shell {
        height: 100%;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 0px;
        transition: grid-template-columns 240ms ease;
      }

      .playground-thread-detail-shell.is-task-detail-open {
        grid-template-columns: minmax(0, 1fr) minmax(440px, 520px);
      }

      .playground-thread-detail-main {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        transition: transform 240ms ease;
      }

      .playground-thread-detail-panel {
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        opacity: 0;
        transform: translateX(24px);
        pointer-events: none;
        transition: opacity 240ms ease, transform 240ms ease;
        background: rgba(0, 0, 0, 0.5);
      }

      .playground-thread-detail-shell.is-task-detail-open .playground-thread-detail-panel {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
        margin-top: calc(-1 * var(--playground-content-nav-height, 50px));
        height: calc(100% + var(--playground-content-nav-height, 50px));
      }

      .playground-tasks-shell {
        height: 100%;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 0px);
        position: relative;
        transition: grid-template-columns 260ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .playground-tasks-shell.is-detail-open {
        grid-template-columns: minmax(0, 1fr) minmax(440px, 520px);
      }

      .playground-tasks-shell.is-detail-open.is-preview-open {
        grid-template-columns: minmax(0, 1fr) minmax(760px, 920px);
      }

      .playground-tasks-main {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .playground-tasks-shell.is-detail-open .playground-tasks-main {
        border-right: 0;
      }

      .playground-tasks-detail-panel {
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        opacity: 0;
        transform: translateX(18px);
        pointer-events: none;
        border-left: 1px solid transparent;
        background: rgba(0, 0, 0, 0.5);
        transition:
          opacity 180ms ease,
          transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 260ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .playground-tasks-shell.is-detail-open .playground-tasks-detail-panel {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
        border-left-color: rgba(255, 255, 255, 0.08);
      }

      .playground-tasks-detail-panel.is-inline-detail {
        height: 100%;
        opacity: 1;
        transform: none;
        pointer-events: auto;
        border-left-color: rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.5);
      }

      .playground-thread-task-drawer .playground-tasks-detail-panel.is-inline-detail {
        border-left: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-thread-task-drawer .playground-tasks-detail-panel.is-inline-detail .playground-tasks-detail-navbar {
        min-height: 56px;
        padding: 0 10px;
        background: transparent;
        box-sizing: border-box;
      }

      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail) {
        --playground-content-nav-height: 56px;
        --playground-task-detail-sidebar-inset: 23px;
      }

      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        > .playground-content-body.is-tasks-page,
      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        > .playground-content-body.is-calendar-page {
        overflow: visible;
      }

      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        .playground-tasks-shell.is-detail-open
        > .playground-tasks-detail-panel.is-project-task-detail {
        margin-top: calc(-1 * var(--playground-content-nav-height, 56px));
        height: calc(100% + var(--playground-content-nav-height, 56px));
        border-left: 0;
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        .playground-tasks-shell.is-detail-open
        > .playground-tasks-detail-panel.is-project-task-detail
        .playground-tasks-detail-main,
      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        .playground-tasks-shell.is-detail-open
        > .playground-tasks-detail-panel.is-project-task-detail
        .playground-tasks-detail-body {
        background: transparent;
      }

      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        .playground-tasks-shell.is-detail-open
        > .playground-tasks-detail-panel.is-project-task-detail
        .playground-tasks-detail-navbar {
        padding-left: var(--playground-task-detail-sidebar-inset, 18px);
        padding-right: var(--playground-task-detail-sidebar-inset, 18px);
      }

      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        .playground-tasks-shell.is-detail-open
        > .playground-tasks-detail-panel.is-project-task-detail
        .playground-tasks-detail-navbar-ticket {
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        .playground-tasks-shell.is-detail-open
        > .playground-tasks-detail-panel.is-project-task-detail
        .playground-tasks-detail-scroll {
        padding-left: calc(var(--playground-task-detail-sidebar-inset, 18px) - 5px);
        padding-right: var(--playground-task-detail-sidebar-inset, 18px);
      }

      .playground-content-shell:has(.playground-tasks-shell.is-detail-open > .playground-tasks-detail-panel.is-project-task-detail)
        .playground-tasks-shell.is-detail-open
        > .playground-tasks-detail-panel.is-project-task-detail
        .playground-tasks-comment-dock {
        padding-left: var(--playground-task-detail-sidebar-inset, 18px);
        padding-right: var(--playground-task-detail-sidebar-inset, 18px);
        padding-bottom: 15px;
      }

      .playground-tasks-ticket-screen,
      .playground-tasks-ticket-screen-detail,
      .playground-tasks-ticket-screen-scroll,
      .playground-tasks-ticket-screen-inner,
      .playground-tasks-ticket-screen-panel,
      .playground-tasks-ticket-screen-sidebar {
        min-width: 0;
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .playground-tasks-ticket-screen {
        width: 100%;
        height: 100%;
      }

      .playground-tasks-ticket-screen-detail,
      .playground-tasks-ticket-screen-inner,
      .playground-tasks-ticket-screen-panel {
        background: transparent;
        border: 0;
        overflow: hidden;
      }

      .playground-tasks-ticket-screen-scroll {
        overflow: hidden;
      }

      .playground-tasks-ticket-screen-inner,
      .playground-tasks-ticket-screen-panel {
        height: 100%;
      }

      .playground-project-workspace-inner.playground-tasks-ticket-screen-inner {
        width: 100%;
        max-width: none;
        margin-left: 0;
        margin-right: 0;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-shell {
        flex: 1;
        min-height: 0;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-main,
      .playground-tasks-ticket-screen-panel .playground-tasks-detail-body {
        background: transparent;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-main,
      .playground-tasks-ticket-screen-panel .playground-tasks-detail-body,
      .playground-tasks-ticket-screen-panel .playground-tasks-detail-scroll {
        flex: 1 1 auto;
        min-height: 0;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-navbar,
      .playground-tasks-ticket-screen-panel .playground-tasks-detail-scroll,
      .playground-tasks-ticket-screen-panel .playground-tasks-comment-dock {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

	      .playground-tasks-ticket-screen-panel .playground-tasks-detail-navbar {
	        grid-template-columns: minmax(0, 1fr) 0 auto;
	        gap: 0;
	        padding-bottom: 12px;
	        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	      }

	      .playground-tasks-ticket-screen-panel .playground-tasks-detail-navbar-actions {
	        align-self: end;
	        padding-bottom: 4px;
	      }

	      .playground-tasks-ticket-page-actions {
	        display: inline-flex;
	        align-items: center;
	        justify-content: flex-end;
	        gap: 6px;
	      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-navbar .playground-content-nav-center {
        display: none;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-navbar-title {
        width: 100%;
        max-width: none;
        gap: 12px;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-navbar-title-meta {
        gap: 12px;
      }

      .playground-tasks-ticket-page-nav-title {
        min-width: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 5px;
      }

      .playground-tasks-ticket-page-nav-ticket-row {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
        width: fit-content;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        font: inherit;
        text-align: left;
        padding: 0;
        cursor: pointer;
      }

      .playground-tasks-ticket-page-nav-ticket-row:hover {
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-tasks-ticket-page-nav-ticket-row:focus-visible {
        outline: 1px solid rgba(255, 255, 255, 0.42);
        outline-offset: 3px;
      }

      .playground-tasks-ticket-page-nav-back {
        width: 14px;
        height: 14px;
        flex: 0 0 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: currentColor;
        padding: 0;
        cursor: pointer;
      }

      .playground-tasks-ticket-page-nav-back:hover,
      .playground-tasks-ticket-page-nav-ticket-row:hover .playground-tasks-ticket-page-nav-back,
      .playground-tasks-ticket-page-nav-ticket-row:hover .playground-tasks-ticket-page-nav-ticket {
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-tasks-ticket-page-nav-ticket {
        color: rgba(255, 255, 255, 0.7);
        font-size: 10px;
        font-weight: 400;
        line-height: 1;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-ticket-page-nav-title-input {
        font-size: 18px;
        font-weight: 500;
        line-height: 1.18;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-comment-dock {
        margin-top: auto;
        padding-bottom: 0;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-comments > .playground-tasks-comment-dock {
        margin-top: 12px;
        padding: 0;
        background: transparent;
      }

	      .playground-tasks-ticket-screen-panel .playground-tasks-detail-shell.is-ticket-full-page {
	        grid-template-columns: minmax(0, 1fr) 320px 0px;
	        column-gap: 42px;
	        row-gap: 0;
	      }

	      .playground-tasks-ticket-screen-panel .playground-tasks-detail-shell.is-ticket-full-page.is-preview-open {
	        grid-template-columns: minmax(0, 1fr) 320px minmax(300px, 360px);
	        column-gap: 42px;
	        row-gap: 0;
	      }

	      .playground-tasks-ticket-screen-panel .playground-tasks-detail-shell.is-ticket-full-page.is-ticket-sidebar-collapsed {
	        grid-template-columns: minmax(0, 1fr) 0px 0px;
	        gap: 0;
	      }

	      .playground-tasks-ticket-screen-panel .playground-tasks-detail-shell.is-ticket-full-page.is-ticket-sidebar-collapsed.is-preview-open {
	        grid-template-columns: minmax(0, 1fr) 0px minmax(300px, 360px);
	        gap: 0;
	      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-shell.is-ticket-full-page > .playground-tasks-detail-main {
        grid-column: 1;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-shell.is-ticket-full-page > .playground-tasks-ticket-screen-sidebar {
        grid-column: 2;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-shell.is-ticket-full-page > .playground-tasks-detail-preview-pane {
        grid-column: 3;
      }

	      .playground-tasks-ticket-screen-sidebar {
	        flex: 0 0 320px;
	        width: 320px;
	        display: flex;
	        flex-direction: column;
		        gap: 12px;
			        padding-top: 12px;
		        overflow: auto;
		        scrollbar-width: none;
		        transition: width 220ms cubic-bezier(0.16, 1, 0.3, 1), flex-basis 220ms cubic-bezier(0.16, 1, 0.3, 1);
		      }

	      .playground-tasks-detail-shell.is-ticket-full-page.is-ticket-sidebar-collapsed > .playground-tasks-ticket-screen-sidebar {
	        flex-basis: 0;
	        width: 0;
	        min-width: 0;
	        overflow: hidden;
	        pointer-events: none;
	      }

	      .playground-tasks-ticket-screen-sidebar::-webkit-scrollbar {
	        display: none;
	      }

		      .playground-tasks-ticket-sidebar-card,
		      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-threads-section,
		      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-facts {
		        position: relative;
		        overflow: hidden;
		        border: 1px solid rgba(255, 255, 255, 0.05);
		        border-radius: 10px;
		        background: rgba(255, 255, 255, 0.05);
	        padding: 12px;
	        display: flex;
	        flex-direction: column;
	        gap: 12px;
	        box-sizing: border-box;
	      }

		      .playground-tasks-ticket-sidebar-card::before,
		      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-threads-section::before,
		      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-facts::before {
	        content: "";
	        position: absolute;
	        inset: 0;
	        pointer-events: none;
        border-radius: inherit;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 48%);
	        opacity: 0.45;
	      }

	      .playground-tasks-ticket-screen-sidebar .playground-tasks-ticket-controls-card::before,
	      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-threads-section::before {
	        content: none;
	        display: none;
	      }

	      .playground-tasks-ticket-sidebar-card > *,
	      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-threads-section > *,
	      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-facts > * {
	        position: relative;
	        z-index: 1;
	      }

	      .playground-tasks-ticket-sidebar-card-title,
	      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-section-title,
	      .playground-tasks-ticket-screen-sidebar .playground-plugins-section-title {
	        color: rgba(255, 255, 255, 0.94);
	        font-size: 12px;
	        line-height: 1.25;
	        font-weight: 500;
	      }

	      .playground-tasks-ticket-screen-sidebar .playground-tasks-detail-facts {
	        overflow: visible;
	        box-shadow: none;
	        backdrop-filter: blur(50px);
	        -webkit-backdrop-filter: blur(50px);
	      }

		      .playground-tasks-ticket-sidebar-toggle-button {
		        flex: 0 0 auto;
		      }

      .playground-tasks-ticket-controls-card {
        gap: 12px;
      }

      .playground-tasks-ticket-controls-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-tasks-ticket-thread-run-row {
        margin-top: auto;
      }

      .playground-tasks-ticket-control-button {
        width: 100%;
        min-height: 34px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.94);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 7px 12px;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 500;
        cursor: pointer;
      }

      .playground-tasks-ticket-control-button:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12);
      }

      .playground-tasks-ticket-control-button:disabled {
        cursor: default;
        opacity: 0.48;
      }

      .playground-tasks-ticket-control-button.is-danger {
        color: rgba(255, 111, 132, 0.95);
      }

      .playground-tasks-ticket-screen-sidebar .playground-plugins-section-header {
        padding-bottom: 0 !important;
        border-bottom: 0 !important;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-close-button {
        display: none;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-detail-navbar-ticket {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 400;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-attachments-environment-button,
      .playground-tasks-ticket-screen-panel .playground-tasks-skills-manage-button {
        min-height: 0 !important;
        height: auto;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: none !important;
        color: #66a6ff !important;
        font-size: 12px !important;
        font-weight: 400 !important;
        line-height: 1.2;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-attachments-environment-button::before,
      .playground-tasks-ticket-screen-panel .playground-tasks-skills-manage-button::before {
        content: none !important;
        display: none !important;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-attachments-environment-button:hover:not(:disabled),
      .playground-tasks-ticket-screen-panel .playground-tasks-skills-manage-button:hover:not(:disabled),
      .playground-tasks-ticket-screen-panel .playground-tasks-skills-manage-button.is-active {
        background: transparent !important;
        color: #66a6ff !important;
      }

      .playground-tasks-detail-shell {
        width: 100%;
        height: 100%;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 0px;
        transition: grid-template-columns 220ms ease;
      }

      .playground-tasks-detail-shell.is-preview-open {
        grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
      }

      .playground-tasks-detail-main {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .playground-tasks-detail-body {
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .playground-tasks-detail-preview-pane {
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        opacity: 0;
        transform: translateX(24px);
        pointer-events: none;
        border-left: 1px solid transparent;
        background: rgba(0, 0, 0, 0.5);
        transition: opacity 220ms ease, transform 220ms ease, border-color 220ms ease;
      }

      .playground-tasks-detail-shell.is-preview-open .playground-tasks-detail-preview-pane {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
        border-left-color: rgba(255, 255, 255, 0.08);
      }

      .playground-tasks-detail-preview-host {
        width: 100%;
        height: 100%;
        min-height: 0;
      }

      .playground-tasks-main-scroll {
        min-height: 0;
        flex: 1;
        overflow: auto;
        padding: 20px 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .playground-tasks-main-scroll.is-project-workspace {
        padding: 0;
        gap: 0;
      }

      .playground-tasks-main-scroll.is-projects-home {
        padding: 0 5px 5px 0;
      }

      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-view-section,
      .playground-content-body.is-calendar-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-view-section,
      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-loading-state,
      .playground-content-body.is-calendar-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-loading-state,
      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-empty,
      .playground-content-body.is-calendar-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-empty,
      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-environments-error,
      .playground-content-body.is-calendar-page .playground-tasks-main-scroll.is-projects-home > .playground-environments-error {
        margin: 0;
        border: 0;
        border-radius: 0;
        background: #000;
        background-clip: padding-box;
        box-sizing: border-box;
        overflow: hidden;
      }

      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-view-section,
      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-loading-state,
      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-tasks-empty,
      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-environments-error {
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
        max-width: none;
        margin: 0;
      }

      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface {
        padding: 0;
        display: flex;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
      }

      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface.is-card-grid {
        padding: 24px 24px 56px;
        display: block;
        flex: 0 0 auto;
        min-height: 100%;
        overflow: visible;
      }

      .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface.is-empty-hero {
        width: min(100%, calc(var(--playground-centered-page-max-width) + 88px));
        max-width: calc(var(--playground-centered-page-max-width) + 88px);
        margin: 0 auto;
        padding: 42px 44px 48px;
        display: block;
        flex: 0 0 auto;
        min-height: auto;
        overflow: visible;
      }

      .playground-projects-overview-inner {
        width: 100%;
        max-width: none;
        margin: 0;
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-projects-overview-surface.is-card-grid .playground-projects-overview-inner {
        width: min(100%, calc(var(--playground-thread-content-max-width) + 48px));
        max-width: calc(var(--playground-thread-content-max-width) + 48px);
        margin: 0 auto;
        min-height: auto;
        flex: initial;
        gap: 26px;
      }

      .playground-projects-library-header {
        gap: 12px;
      }

      .playground-projects-library-title-row {
        align-items: center;
      }

      .playground-projects-library-search {
        width: min(240px, 34vw);
      }

      .playground-projects-library-nav-row {
        justify-content: space-between !important;
        min-height: 30px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-projects-library-tabs.content-mode-switch {
        height: 30px;
      }

      .playground-projects-library-tabs .playground-files-library-tab {
        min-width: 0;
        padding-left: 16px;
        padding-right: 16px;
      }

      .playground-projects-library-controls .playground-tasks-toolbar-popup-menu {
        right: 0;
        left: auto;
        top: calc(100% + 8px);
        width: 260px;
      }

      .playground-projects-overview-surface.is-empty-hero .playground-projects-overview-inner {
        width: 100%;
        max-width: none;
        margin: 0;
        min-height: auto;
        flex: initial;
        gap: 30px;
      }

      .playground-projects-list-shell {
        width: 100%;
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 0;
        overflow: hidden;
      }

      .playground-projects-list-toolbar {
        flex: 0 0 auto;
        min-height: 44px;
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-projects-list-toolbar-left,
      .playground-projects-list-toolbar-actions {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-projects-list-view-pill {
        min-height: 34px;
        padding: 0 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.94);
        font: inherit;
        font-size: 13px;
        line-height: 1;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-projects-list-add-button,
      .playground-projects-list-icon-button {
        width: 34px;
        height: 34px;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 160ms ease, background 160ms ease, border-color 160ms ease;
      }

      .playground-projects-list-add-button:hover,
      .playground-projects-list-icon-button:hover {
        border-color: rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.14);
        color: rgba(255, 255, 255, 0.95);
      }

      .playground-projects-list-add-button svg,
      .playground-projects-list-icon-button svg {
        width: 16px;
        height: 16px;
      }

      .playground-projects-list-table {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .playground-projects-list-header,
      .playground-projects-list-row {
        display: grid;
        grid-template-columns: minmax(360px, 1fr) 180px 100px 120px 130px 90px 110px;
        align-items: center;
        gap: 16px;
      }

      .playground-projects-list-header {
        flex: 0 0 auto;
        padding: 0 54px 10px 62px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-projects-list-body {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        overflow: auto;
        scrollbar-width: none;
      }

      .playground-projects-list-body::-webkit-scrollbar {
        display: none;
      }

      .playground-projects-list-row {
        width: 100%;
        min-height: 72px;
        padding: 0 18px 0 16px;
        border: 0;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        text-align: left;
        cursor: pointer;
        box-sizing: border-box;
        transition: background 160ms ease;
      }

      .playground-projects-list-row:hover {
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-projects-list-name-cell {
        min-width: 0;
        display: grid;
        grid-template-columns: 22px 24px minmax(0, 1fr);
        align-items: center;
        gap: 12px;
      }

      .playground-projects-list-checkbox {
        width: 18px;
        height: 18px;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 5px;
        background: transparent;
        color: transparent;
        cursor: pointer;
      }

      .playground-projects-list-project-icon {
        width: 22px;
        height: 22px;
        color: rgba(255, 255, 255, 0.74);
      }

      .playground-projects-list-project-main {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-projects-list-project-title {
        min-width: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        line-height: 1.2;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-projects-list-project-type {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: rgba(255, 255, 255, 0.45);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-projects-list-project-type-dot {
        width: 10px;
        height: 10px;
        flex: 0 0 auto;
        transform: rotate(45deg);
        border-radius: 2px;
        border: 1.5px solid var(--project-blueprint-accent, rgba(255, 255, 255, 0.4));
        opacity: 0.72;
      }

      .playground-projects-list-health {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 13px;
        line-height: 1.2;
        font-weight: 500;
        white-space: nowrap;
      }

      .playground-projects-list-health-icon {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
        border-radius: 999px;
        background: rgba(84, 214, 100, 0.18);
        color: #65d46d;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      }

      .playground-projects-list-health-label {
        color: #65d46d;
      }

      .playground-projects-list-health-meta {
        color: rgba(101, 212, 109, 0.72);
        font-weight: 400;
      }

      .playground-projects-list-priority {
        display: inline-flex;
        align-items: flex-end;
        gap: 3px;
        height: 18px;
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-projects-list-priority-bar {
        width: 4px;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.46;
      }

      .playground-projects-list-priority-bar:nth-child(1) {
        height: 7px;
      }

      .playground-projects-list-priority-bar:nth-child(2) {
        height: 12px;
      }

      .playground-projects-list-priority-bar:nth-child(3) {
        height: 17px;
      }

      .playground-projects-list-priority-bar.is-active {
        opacity: 0.88;
      }

      .playground-projects-list-lead {
        min-width: 0;
        display: inline-flex;
        align-items: center;
      }

      .playground-projects-list-avatar {
        width: 22px;
        height: 22px;
        border-radius: 999px;
        object-fit: cover;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.88);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        line-height: 1;
        font-weight: 400;
        overflow: hidden;
      }

      .playground-projects-list-target,
      .playground-projects-list-issues {
        min-width: 0;
        color: rgba(255, 255, 255, 0.62);
        font-size: 13px;
        line-height: 1.2;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }

      .playground-projects-list-target svg {
        width: 16px;
        height: 16px;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-projects-list-muted {
        color: rgba(255, 255, 255, 0.36);
      }

      .playground-projects-list-status {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 13px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-projects-list-status-ring {
        width: 17px;
        height: 17px;
        border-radius: 999px;
        border: 2px dotted rgba(255, 176, 61, 0.9);
        box-sizing: border-box;
      }

      .playground-projects-list-empty {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: rgba(255, 255, 255, 0.58);
        text-align: center;
        padding: 32px;
      }

      .playground-projects-list-empty-title {
        color: rgba(255, 255, 255, 0.94);
        font-size: 16px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-projects-list-empty-copy {
        max-width: 420px;
        font-size: 12px;
        line-height: 1.45;
        font-weight: 400;
      }

      .playground-project-workspace-inner {
        position: relative;
        z-index: 1;
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        min-height: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-project-workspace-inner > .playground-tasks-view-section,
      .playground-project-workspace-inner > .playground-tasks-backlog-view,
      .playground-project-workspace-inner > .playground-tasks-loading-state,
      .playground-project-workspace-inner > .playground-tasks-empty,
      .playground-project-workspace-inner > .playground-environments-error {
        width: 100%;
      }

      .playground-projects-overview-title-block {
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-projects-overview-surface.is-card-grid .playground-projects-overview-title-block {
        padding-bottom: 0;
        border-bottom: 0;
      }

`;
