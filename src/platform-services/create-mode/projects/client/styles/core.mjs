export const PROJECTS_CORE_CSS = `
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
        margin-bottom: 5px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 15px;
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

      .playground-projects-overview-surface.is-empty-hero .playground-projects-overview-title-block {
        padding-bottom: 0;
        border-bottom: 0;
      }

      .playground-projects-overview-title-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-projects-overview-title-block .playground-project-overview-summary-title {
        font-size: 18px;
        line-height: 1.2;
      }

      .playground-projects-overview-title-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }

      .playground-projects-overview-add-button {
        white-space: nowrap;
        box-sizing: border-box;
      }

      .playground-projects-overview-add-button svg {
        width: 14px;
        height: 14px;
      }

      @media (max-width: 1100px) {
        .playground-projects-list-header,
        .playground-projects-list-row {
          grid-template-columns: minmax(280px, 1fr) 160px 90px 90px 90px;
        }

        .playground-projects-list-col-target,
        .playground-projects-list-col-issues,
        .playground-projects-list-target,
        .playground-projects-list-issues {
          display: none;
        }
      }

      .playground-projects-working-agent-section {
        width: 100%;
        color: #fff;
      }

      .playground-projects-working-agent-card {
        position: relative;
        width: 100%;
        height: 710px;
        overflow: hidden;
        border-radius: 20px;
        background: #000;
      }

      .playground-projects-working-agent-card::after {
        content: "";
        position: absolute;
        z-index: 8;
        inset: 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: inherit;
        pointer-events: none;
      }

      .playground-projects-working-agent-image {
        display: block;
        width: 100%;
        height: 710px;
        margin-bottom: -50px;
        object-fit: cover;
        object-position: center top;
        border-radius: 20px;
      }

      .playground-projects-working-agent-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 64px 24px 32px;
      }

      .playground-projects-working-agent-title {
        margin: 0;
        text-align: center;
        color: #fff;
        font-size: 48px;
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-projects-working-agent-title-emphasis {
        font-family: Georgia, serif;
        font-style: italic;
      }

      .playground-projects-working-agent-copy {
        max-width: 680px;
        margin: 16px auto 0;
        padding: 0 4px;
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        line-height: 1.55;
        font-weight: 400;
      }

      .playground-projects-working-agent-features {
        margin-top: 36px;
        margin-bottom: 24px;
      }

      .playground-projects-working-agent-features .playground-configure-sections {
        gap: 48px;
      }

      .playground-projects-feature-row {
        cursor: default;
      }

      .playground-projects-feature-row .playground-configure-row-title,
      .playground-projects-feature-row .playground-configure-row-subtitle {
        overflow: visible;
        text-overflow: clip;
        white-space: normal;
      }

      .playground-projects-feature-row .playground-configure-row-subtitle {
        line-height: 1.45;
      }

      .playground-projects-working-agent-logos {
        position: relative;
        width: min(100%, 1100px);
        height: 76px;
        margin: 36px auto 0;
      }

      .playground-projects-logo-carousel-line {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        width: 2px;
        height: 120px;
        border-radius: 999px;
        transform: translate(-50%, -50%);
        background: linear-gradient(to bottom, transparent 0%, #3b82f6 20%, #3b82f6 80%, transparent 100%);
        box-shadow: 0 0 5px #3b82f6;
        pointer-events: none;
        transition: width 200ms ease, box-shadow 200ms ease;
      }

      .playground-projects-logo-carousel-line.is-pulsing {
        width: 3px;
        box-shadow: 0 0 8px #3b82f6;
      }

      .playground-projects-logo-carousel-center {
        position: absolute;
        z-index: 4;
        top: 50%;
        left: 50%;
        width: 64px;
        height: 64px;
        transform: translate(-50%, -50%);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 0 40px rgba(255, 255, 255, 0.2), 0 0 80px rgba(255, 255, 255, 0.1);
        transition: transform 200ms ease;
      }

      .playground-projects-logo-carousel-center.is-pulsing {
        transform: translate(-50%, -50%) scale(1.1);
      }

      .playground-projects-logo-carousel-center::before {
        content: "";
        position: absolute;
        inset: -45px;
        border-radius: 28px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 48%, transparent 70%);
        filter: blur(8px);
        z-index: -1;
      }

      .playground-projects-logo-carousel-center img,
      .playground-projects-logo-carousel-item img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .playground-projects-logo-carousel-mask {
        width: 100%;
        height: 76px;
        overflow: hidden;
        display: flex;
        align-items: center;
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
        mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
      }

      .playground-projects-logo-carousel-track {
        display: flex;
        align-items: center;
        gap: 44px;
        animation: playground-projects-logo-carousel-scroll 40s linear infinite;
        will-change: transform;
      }

      .playground-projects-logo-carousel-item {
        flex: 0 0 52px;
        width: 52px;
        height: 52px;
        border-radius: 12px;
        overflow: hidden;
      }

      @keyframes playground-projects-logo-carousel-scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-1152px);
        }
      }

      @media (max-width: 980px) {
        .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface.is-empty-hero {
          padding: 24px 18px 36px;
        }
      }

      @media (max-width: 767px) {
        .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface {
          padding: 0;
        }

        .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface.is-empty-hero {
          width: 100%;
          max-width: none;
          padding: 24px 18px 36px;
        }

        .playground-projects-working-agent-card {
          min-height: 420px;
        }

        .playground-projects-working-agent-image {
          position: absolute;
          top: 208px;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: calc(100% - 208px);
          object-fit: cover;
          object-position: bottom;
        }

        .playground-projects-working-agent-card::before {
          content: "";
          position: absolute;
          z-index: 1;
          top: 208px;
          left: 0;
          right: 0;
          height: 128px;
          border-radius: 20px 20px 0 0;
          background: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0) 100%);
        }

        .playground-projects-working-agent-overlay {
          z-index: 2;
          padding: 16px 16px 48px;
        }

        .playground-projects-working-agent-title {
          font-size: 24px;
          line-height: 1.12;
        }

        .playground-projects-working-agent-copy {
          max-width: 520px;
          margin-top: 12px;
        }

        .playground-projects-working-agent-logos {
          margin-top: 14px;
        }

        .playground-projects-working-agent-features .playground-configure-sections {
          grid-template-columns: minmax(0, 1fr);
          gap: 28px;
        }
      }

      .playground-tasks-detail-scroll {
        padding: 9px 18px 28px;
        gap: 12px;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .playground-tasks-detail-scroll::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

      .playground-tasks-detail-navbar {
        position: relative;
        z-index: 40;
        flex-shrink: 0;
        border-bottom: 0;
      }

      .playground-tasks-detail-navbar-title {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-tasks-detail-navbar-title-meta {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .playground-tasks-detail-navbar-title-main {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
      }

      .playground-tasks-detail-navbar-title-editable {
        gap: 8px;
      }

      .playground-tasks-detail-navbar-title-hint {
        flex: 0 0 auto;
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.42);
        pointer-events: none;
      }

      .playground-tasks-detail-navbar-title .playground-content-title {
        min-width: 0;
      }

      .playground-tasks-detail-navbar-title-input {
        display: block;
        width: 100%;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
        outline: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.2;
        box-sizing: border-box;
      }

      .playground-tasks-detail-navbar-title-input::placeholder {
        color: rgba(255, 255, 255, 0.38);
      }

      .playground-tasks-detail-navbar-title-input[readonly] {
        cursor: default;
        opacity: 0.88;
      }

      .playground-tasks-detail-navbar-ticket {
        flex: 0 0 auto;
        color: #66a6ff;
        font-size: 13px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-tasks-detail-navbar-status {
        flex: 0 0 auto;
      }

      .playground-tasks-backlog-status.playground-tasks-detail-navbar-status {
        border-radius: 999px;
      }

      .playground-tasks-detail-navbar-actions {
        position: relative;
        z-index: 41;
        gap: 4px;
      }

      .playground-tasks-detail-thread-link-row {
        padding: 0 0 10px;
      }

      .playground-tasks-detail-thread-card {
        width: 100%;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-tasks-detail-thread-card-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-tasks-detail-thread-card-title {
        min-width: 0;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-tasks-detail-thread-card-description {
        min-width: 0;
        font-size: 11px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-tasks-detail-thread-card-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-tasks-detail-thread-card-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 28px;
        padding: 0 12px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.88);
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
        overflow: hidden;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-tasks-detail-thread-card-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: 999px;
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

      .playground-tasks-detail-thread-card-button:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }

      .playground-tasks-detail-threads-section.playground-plugins-section {
        gap: 0px;
        margin-bottom: 0;
      }

      .playground-tasks-detail-threads-section + .playground-tasks-detail-description {
        margin-top: 12px;
      }

      .playground-tasks-detail-threads-section .playground-plugins-section-header {
        margin-top: 0;
        padding-bottom: 0;
        border-bottom: 0;
      }

	      .playground-tasks-detail-threads-section .playground-plugins-section-title {
	        font-size: 14px;
	        font-weight: 400;
	        line-height: 1.3;
	      }

      .playground-tasks-detail-threads-section .playground-plugins-search-row {
        align-items: stretch;
        gap: 8px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-detail-threads-section .playground-plugins-search-shell {
        flex: 0 1 360px;
        width: min(360px, 100%);
        min-width: 0;
        max-width: 360px;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-shell {
        position: relative;
        overflow: hidden;
        border: 0;
        border-radius: 999px;
        background: transparent;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-shell::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-card-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-environments-action-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-connectors::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-facts::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.15),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.07),
          rgba(255, 255, 255, 0.3)
        );
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }

      .playground-tasks-detail-threads-section .playground-plugins-search {
        min-height: 32px;
        font-size: 12px;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-icon {
        position: relative;
        z-index: 1;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search {
        min-height: 32px;
        line-height: 32px;
        padding-top: 0;
        padding-bottom: 0;
        border: 0;
        background: rgba(255, 255, 255, 0.05);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
        box-sizing: border-box;
      }

      .playground-tasks-detail-threads-section .playground-files-control-button {
        min-height: 32px;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-row {
        align-items: stretch;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-shell {
        height: auto;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-card-button,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-environments-action-button,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button {
        position: relative;
        overflow: hidden;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button {
        min-height: 32px;
        padding: 0 14px;
        align-items: center;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-card-button > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-environments-action-button > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button:hover,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button.is-active,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-card-button:hover,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button:hover,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-environments-action-button:hover,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button:hover:enabled,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button.is-approve:hover:enabled {
        background: transparent;
        color: #fff;
        opacity: 0.78;
      }

      .playground-tasks-detail-thread-list {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-tasks-detail-thread-row {
        width: 100%;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-tasks-detail-thread-row:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .playground-tasks-detail-thread-main {
        min-width: 0;
        flex: 1 1 auto;
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        grid-template-rows: auto auto;
        column-gap: 8px;
        row-gap: 3px;
        align-items: center;
      }

      .playground-tasks-detail-thread-status-icon {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        grid-column: 1;
        grid-row: 1 / span 2;
        align-self: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-tasks-detail-thread-status-icon svg {
        width: 11px;
        height: 11px;
      }

      .playground-tasks-detail-thread-status-icon.is-running,
      .playground-tasks-detail-thread-status-icon.is-permission {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-tasks-detail-thread-status-icon.is-running svg,
      .playground-tasks-detail-thread-status-icon.is-permission svg {
        animation: spinner-rotate 1s linear infinite;
      }

      .playground-tasks-detail-thread-status-icon.is-completed {
        background: rgba(95, 214, 154, 0.14);
        color: #5fd69a;
      }

      .playground-tasks-detail-thread-status-icon.is-failed {
        background: rgba(255, 112, 112, 0.14);
        color: #ff8585;
      }

      .playground-tasks-detail-thread-title {
        min-width: 0;
        grid-column: 2;
        grid-row: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-tasks-detail-thread-meta {
        min-width: 0;
        grid-column: 2;
        grid-row: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        line-height: 1.35;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-tasks-detail-thread-status {
        flex: 0 0 auto;
        max-width: 118px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-radius: 999px;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.62);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-tasks-detail-thread-status.is-running {
        background: rgba(102, 166, 255, 0.14);
        color: #8fc4ff;
      }

      .playground-tasks-detail-thread-status.is-permission {
        background: rgba(255, 214, 102, 0.14);
        color: #ffe099;
      }

      .playground-tasks-detail-thread-status.is-completed {
        background: rgba(120, 255, 194, 0.12);
        color: #93ffd0;
      }

      .playground-tasks-detail-thread-status.is-failed {
        background: rgba(255, 112, 112, 0.14);
        color: #ffb0b0;
      }

      .playground-tasks-detail-thread-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .playground-tasks-detail-thread-action {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, 0.54);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-tasks-detail-thread-action:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-tasks-detail-thread-empty {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 12px 0 2px;
      }

      .playground-tasks-detail-thread-empty-copy {
        min-width: 0;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button {
        flex: 0 0 auto;
      }

      .playground-tasks-detail-thread-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 10px;
      }

      .playground-tasks-detail-thread-footer .playground-environments-action-button {
        min-height: 32px;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button {
        min-height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 14px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
        transition: opacity 160ms ease, transform 160ms ease;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button:hover:enabled {
        opacity: 0.7;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button.is-approve {
        border-color: #fff;
        background: #fff;
        color: #000;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button.is-approve:hover:enabled {
        opacity: 0.7;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button:active:enabled {
        transform: translateY(1px);
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button:disabled {
        opacity: 0.38;
        cursor: default;
      }

      @media (max-width: 620px) {
        .playground-tasks-detail-thread-row {
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .playground-tasks-detail-thread-status,
        .playground-tasks-detail-thread-actions {
          margin-left: 0;
        }
      }

      .playground-tasks-detail-facts {
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 4px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 10px;
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(50px);
      }

	      .playground-tasks-detail-facts::before {
	        content: none;
	        display: none;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-server-detail-metrics .playground-agent-runtime-settings-card.playground-server-details-card::before {
	        content: "";
	        display: block;
	        pointer-events: none;
	        position: absolute;
	        inset: 0;
	        z-index: 5;
	        border-radius: inherit;
	        padding: 1px;
	        background: var(--playground-project-overview-chart-border);
	        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
	        mask-clip: content-box, border-box;
	        mask-composite: exclude;
	        mask-origin: content-box, border-box;
	        mask-repeat: repeat, repeat;
	        mask-size: auto, auto;
	      }

	      .playground-server-detail-content .playground-database-browser-surface.playground-server-details-card,
	      .playground-server-detail-content .playground-auth-users-surface.playground-server-details-card {
	        --playground-project-overview-chart-border: linear-gradient(
	          -10deg,
	          rgba(200, 200, 200, 0.25),
	          rgba(255, 255, 255, 0.1),
	          rgba(255, 255, 255, 0.15),
	          rgba(255, 255, 255, 0.375)
	        );
	        position: relative;
	        margin-bottom: 24px;
	        padding: 20px;
	        border: 0;
	        border-radius: 15px;
	        overflow: hidden;
	        background: transparent;
	        -webkit-backdrop-filter: blur(50px);
	        backdrop-filter: blur(50px);
	      }

	      .playground-server-detail-content .playground-database-browser-surface.playground-server-details-card::before,
	      .playground-server-detail-content .playground-auth-users-surface.playground-server-details-card::before {
	        content: "";
	        display: block;
	        pointer-events: none;
	        position: absolute;
	        inset: 0;
	        z-index: 5;
	        border-radius: inherit;
	        padding: 1px;
	        background: var(--playground-project-overview-chart-border);
	        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
	        mask-clip: content-box, border-box;
	        mask-composite: exclude;
	        mask-origin: content-box, border-box;
	        mask-repeat: repeat, repeat;
	        mask-size: auto, auto;
	      }

	      .playground-server-detail-content .playground-database-browser-surface.playground-server-details-card > *,
	      .playground-server-detail-content .playground-auth-users-surface.playground-server-details-card > * {
	        position: relative;
	        z-index: 1;
	      }

	      .playground-server-detail-content .playground-database-browser-surface.playground-server-details-card {
	        padding: 0;
	      }

	      .playground-resources-page.is-develop-server-kind-page.is-database-data-tab {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page > .playground-environments-detail-scroll.playground-settings-detail-scroll.is-database-data-tab,
	      .playground-resources-page.is-develop-server-kind-page > .playground-environments-detail-scroll.playground-settings-detail-scroll:has(.playground-environments-editor-main.playground-tasks-detail-main.is-database-data-tab) {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        padding-bottom: 24px;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-resources-detail-content.is-database-data-tab,
	      .playground-resources-page.is-develop-server-kind-page .playground-resources-detail-content:has(.playground-environments-editor-main.playground-tasks-detail-main.is-database-data-tab) {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        display: flex;
	        flex-direction: column;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-editor-main.playground-tasks-detail-main.is-database-data-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-editor-main.playground-tasks-detail-main.is-auth-users-tab {
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-detail-scroll.playground-environments-editor-scroll.is-database-data-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-detail-scroll.playground-environments-editor-scroll.is-auth-users-tab {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        gap: 12px;
	        overflow: hidden;
	      }

	      .playground-database-detail-content.is-database-data-tab {
	        display: flex;
	        flex-direction: column;
	      }

	      .playground-database-detail-header-area {
	        flex: 0 0 auto;
	        min-height: 0;
	      }

	      .playground-database-detail-tab-panel {
	        min-width: 0;
	        min-height: 0;
	      }

	      .playground-database-detail-tab-panel.is-data {
	        flex: 1 1 0;
	        height: 100%;
	        max-height: 100%;
	        display: flex;
	        flex-direction: column;
	        overflow: hidden;
	      }

	      .playground-database-detail-tab-panel.is-usage,
	      .playground-database-detail-tab-panel.is-settings {
	        flex: 0 0 auto;
	      }

	      .playground-database-settings-root {
	        gap: 0;
	      }

	      .playground-database-description-section.playground-agents-detail-instructions-section {
	        margin-bottom: 0;
	        padding-bottom: 6px !important;
	        border: 1px solid rgba(255, 255, 255, 0.075) !important;
	        border-radius: 15px !important;
	        background: rgba(255, 255, 255, 0.075) !important;
	        box-sizing: border-box;
	      }

	      .playground-database-description-section .playground-tasks-detail-section-title {
	        font-size: 12px;
	      }

	      .playground-server-settings-tab .playground-environments-connections-title {
	        font-size: 14px;
	      }

	      .playground-database-settings-root .playground-database-danger-section {
	        margin-top: 24px;
	      }

	      .playground-database-api-quickstart-card {
	        margin-top: 24px;
	      }

	      .playground-database-api-quickstart-editor-shell {
	        width: 100%;
	        height: 220px;
	        min-height: 220px;
	        overflow: hidden;
	        border-radius: 8px;
	      }

	      .playground-database-api-quickstart-editor-loading {
	        width: 100%;
	        height: 220px;
	        display: flex;
	        align-items: center;
	        justify-content: center;
	        color: rgba(255, 255, 255, 0.52);
	        font-size: 12px;
	      }

	      .playground-database-detail-usage-header-actions {
	        width: 100%;
	        display: flex;
	        align-items: center;
	        justify-content: flex-end;
	      }

	      .playground-server-detail-usage-header {
	        justify-content: space-between;
	        gap: 16px;
	        margin-bottom: 12px;
	      }

	      .playground-server-detail-usage-title {
	        min-width: 0;
	        margin: 0;
	        color: rgba(255, 255, 255, 0.95);
	        font-size: 14px;
	        font-weight: 400;
	        line-height: 1.3;
	        white-space: nowrap;
	      }

	      .playground-database-detail-usage-metrics.playground-environments-home-metrics {
	        width: 100%;
	        margin-bottom: 0;
	      }

	      .playground-database-detail-usage-analytics-card .playground-settings-usage-chart-card {
	        padding: 0;
	        border: 0;
	        border-radius: 0;
	        background: transparent;
	        box-shadow: none;
	      }

	      .playground-database-detail-usage-analytics-card .playground-project-overview-chart-shell {
	        height: 270px;
	        border: 0;
	        background: transparent;
	      }

	      .playground-database-detail-usage-fact-rows {
	        width: 100%;
	        margin-top: 12px;
	      }

	      .playground-function-usage-invoke-section,
	      .playground-web-app-usage-fact-rows {
	        margin-bottom: 24px;
	      }

	      .playground-database-access-table-section,
	      .playground-database-access-table,
	      .playground-database-access-table .playground-project-overview-thread-list,
	      .playground-database-access-table .playground-project-overview-threads-table-row,
	      .playground-database-access-table .playground-project-overview-thread-cell.is-actions {
	        overflow: visible !important;
	      }

	      .playground-database-access-table-section.playground-agents-overview-list-section {
	        position: relative;
	        isolation: isolate;
	        width: 100%;
	        margin: 0 !important;
	        padding: 0 18px 6px;
	        border: 1px solid rgba(255, 255, 255, 0.075);
	        border-radius: 15px;
	        background: rgba(255, 255, 255, 0.075);
	        box-sizing: border-box;
	      }

	      .playground-database-access-table-section.playground-agents-overview-list-section::before {
	        content: none;
	      }

	      .playground-database-access-sticky-table-header {
	        position: relative;
	        z-index: 240;
	        margin: 0 -18px;
	        padding: 12px 18px 0;
	        border-radius: 15px 15px 0 0;
	        background: #121212;
	      }

	      .playground-database-access-section-title {
	        margin: 0;
	        color: #fff;
	        font-size: 14px;
	        font-weight: 400;
	      }

	      .playground-database-access-section-group {
	        width: 100%;
	        margin-top: 24px;
	        overflow: visible;
	      }

	      .playground-database-access-section-header {
	        width: 100%;
	        min-width: 0;
	        margin-bottom: 12px;
	        display: flex;
	        align-items: center;
	        justify-content: space-between;
	        gap: 24px;
	      }

	      .playground-database-access-owner-row {
	        position: relative;
	        z-index: 260;
	        width: auto;
	        min-width: 0;
	        min-height: 32px;
	        margin: 0 0 0 auto;
	        display: flex;
	        align-items: center;
	        justify-content: flex-end;
	        gap: 0;
	      }

	      .playground-database-access-owner-label {
	        margin-right: 24px;
	        color: rgba(255, 255, 255, 0.7);
	        font-size: 12px;
	        font-weight: 400;
	      }

	      .playground-database-owner-popup-shell {
	        flex: 0 1 auto;
	        width: auto;
	        min-width: 0;
	        z-index: 280;
	      }

	      .playground-database-owner-trigger {
	        min-width: 0;
	        max-width: min(320px, 60vw);
	        padding: 4px 0;
	        border: 0;
	        background: transparent;
	        color: inherit;
	        display: flex;
	        align-items: center;
	        justify-content: flex-end;
	        gap: 8px;
	        font: inherit;
	        text-align: right;
	        cursor: pointer;
	      }

	      .playground-database-owner-trigger:disabled {
	        cursor: default;
	        opacity: 0.58;
	      }

	      .playground-database-owner-trigger .playground-team-member-cell {
	        min-width: 0;
	        justify-content: flex-end;
	        gap: 8px;
	      }

	      .playground-database-owner-trigger .playground-team-member-avatar {
	        width: 20px;
	        height: 20px;
	        flex: 0 0 20px;
	        font-size: 8px;
	      }

	      .playground-database-owner-trigger .playground-team-table-title {
	        max-width: 220px;
	        overflow: hidden;
	        color: rgba(255, 255, 255, 0.88);
	        font-size: 12px;
	        font-weight: 400;
	        text-overflow: ellipsis;
	        white-space: nowrap;
	      }

	      .playground-database-owner-popup-shell .playground-database-owner-menu {
	        top: calc(100% + 8px);
	        right: 0;
	        left: auto;
	        width: 280px;
	        min-width: 280px;
	        max-height: min(320px, calc(100vh - 180px));
	        overflow: auto;
	        transform-origin: top right;
	        scrollbar-width: none;
	      }

	      .playground-database-owner-popup-shell .playground-database-owner-menu::-webkit-scrollbar {
	        display: none;
	      }

	      .playground-database-owner-transfer-modal.playground-tasks-project-modal {
	        width: min(500px, calc(100vw - 48px));
	      }

	      .playground-database-owner-transfer-copy {
	        display: flex;
	        flex-direction: column;
	        gap: 12px;
	        padding: 4px 0 8px;
	      }

	      .playground-database-owner-transfer-person {
	        display: flex;
	        align-items: center;
	        gap: 10px;
	      }

	      .playground-database-owner-transfer-person .playground-team-member-avatar {
	        width: 28px;
	        height: 28px;
	        flex: 0 0 28px;
	      }

	      .playground-database-owner-transfer-person-copy {
	        min-width: 0;
	        display: flex;
	        flex-direction: column;
	        gap: 2px;
	      }

	      .playground-database-owner-transfer-person-name {
	        color: #fff;
	        font-size: 13px;
	        font-weight: 500;
	      }

	      .playground-database-owner-transfer-person-email,
	      .playground-database-owner-transfer-warning {
	        color: rgba(255, 255, 255, 0.58);
	        font-size: 12px;
	        font-weight: 400;
	        line-height: 1.5;
	      }

	      .playground-database-access-table-toolbar.playground-develop-server-kind-table-toolbar {
	        display: flex;
	        align-items: center;
	        justify-content: flex-start;
	        gap: 16px;
	        width: 100%;
	        margin: 0;
	        padding: 0 0 12px;
	        border: 0;
	      }

	      .playground-database-access-table-section .playground-database-access-table-toolbar .playground-develop-server-kind-table-controls {
	        flex: 1 1 auto;
	        width: auto;
	        min-width: 0;
	        margin-left: 0 !important;
	        justify-content: flex-start !important;
	        align-items: center;
	        gap: 10px;
	      }

	      .playground-database-access-table-section .playground-database-access-table-toolbar .playground-plugins-toolbar-controls {
	        flex: 0 0 auto;
	        display: flex;
	        align-items: center;
	        justify-content: flex-start;
	        gap: 10px;
	      }

	      .playground-database-access-table-toolbar .playground-develop-server-kind-search-shell {
	        flex: 0 1 340px;
	        width: min(340px, 100%);
	        min-width: 0;
	        max-width: 340px;
	        background: rgba(255, 255, 255, 0.025) !important;
	      }

	      .playground-database-access-table-toolbar > .playground-project-teams-add-shell {
	        flex: 0 0 auto;
	        margin-left: auto;
	      }

	      .playground-database-access-table-toolbar .playground-tasks-toolbar-popup-shell {
	        z-index: 520;
	      }

	      .playground-database-access-table-toolbar .playground-tasks-toolbar-popup-menu {
	        z-index: 521;
	      }

	      .playground-database-access-empty {
	        min-height: 96px;
	        margin: 0;
	        padding: 28px 20px;
	      }

	      .playground-database-access-table .playground-agents-overview-select-checkbox:disabled {
	        cursor: default;
	        opacity: 0.35;
	      }

	      .playground-tasks-toolbar-popup-shell.playground-tasks-toolbar-popup-shell-portal .playground-database-access-action-menu {
	        width: 220px;
	        min-width: 220px;
	        max-height: min(360px, calc(100vh - 24px));
	        transform-origin: top right;
	        pointer-events: auto;
	      }

	      .playground-database-access-table.playground-agents-overview-list-table {
	        width: 100%;
	        margin: 0;
	        padding: 0;
	        border: 0;
	        border-radius: 0;
	        background: transparent;
	      }

	      .playground-database-access-table .playground-project-overview-thread-list {
	        width: calc(100% + 24px);
	        margin: 0 0 0 -12px;
	        padding: 0 12px;
	        border: 1px solid rgba(255, 255, 255, 0.1);
	        border-radius: 10px;
	        background: #000;
	        box-sizing: border-box;
	      }

	      .playground-database-access-table .playground-project-overview-threads-table-header,
	      .playground-database-access-table .playground-project-overview-threads-table-row {
	        grid-template-columns: 21px minmax(220px, 1.35fr) minmax(180px, 0.9fr) minmax(100px, 0.42fr) 28px !important;
	        gap: 12px;
	        width: 100%;
	        max-width: 100%;
	        padding-right: 0;
	        box-sizing: border-box;
	      }

	      .playground-database-access-table .playground-project-overview-threads-table-header {
	        padding-top: 12px;
	        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	        font-size: 12px;
	        font-weight: 400;
	      }

	      .playground-database-access-column-header > div {
	        justify-content: flex-start;
	        text-align: left;
	      }

	      .playground-database-access-column-header > div:first-child {
	        justify-content: center;
	      }

	      .playground-database-access-table .playground-project-overview-threads-table-row {
	        min-height: 58px;
	        padding-top: 12px;
	        padding-bottom: 12px;
	        font-size: 12px;
	      }

	      .playground-database-access-table .playground-project-overview-threads-table-row:last-child {
	        border-bottom: 0;
	      }

	      .playground-database-access-table .playground-project-overview-thread-cell,
	      .playground-database-access-table .playground-agents-overview-name-title,
	      .playground-database-access-table .playground-agents-overview-table-value {
	        min-width: 0;
	        overflow: hidden;
	        text-overflow: ellipsis;
	        white-space: nowrap;
	      }

	      .playground-database-access-table .playground-project-team-action-shell.is-open {
	        z-index: 360;
	      }

	      .playground-database-access-table .playground-project-overview-threads-table-row.is-menu-open,
	      .playground-database-access-table .playground-project-overview-threads-table-row.is-menu-open .playground-project-overview-thread-cell {
	        position: relative;
	        z-index: 320;
	      }

	      .playground-server-detail-content.is-auth-users-tab {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        gap: 12px;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-surface.playground-server-details-card {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        margin-top: 6px;
	        margin-bottom: 0;
	        display: flex;
	        flex-direction: column;
	        padding-bottom: 0;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-tab-body {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        display: flex;
	        flex-direction: column;
	        gap: 12px;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-columns {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-pane,
	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-fields-card {
	        min-height: 0;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab > .playground-agents-overview-tabs,
	      .playground-server-detail-content.is-database-data-tab > .playground-database-storage-location-note,
	      .playground-server-detail-content.is-database-data-tab > .playground-environments-error {
	        flex: 0 0 auto;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-storage-location-note {
	        margin-bottom: 12px;
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-surface.playground-server-details-card {
	        flex: 1 1 auto;
	        min-height: 0;
	        margin-bottom: 0;
	      }

	      .playground-database-storage-location-note {
	        flex: 0 0 auto;
	        display: inline-flex;
	        align-items: center;
	        gap: 6px;
	        color: rgba(255, 255, 255, 0.54);
	        font-size: 12px;
	        font-weight: 400;
	        line-height: 1.45;
	      }

	      .playground-database-storage-location-note svg {
	        flex: 0 0 auto;
	        color: rgba(255, 255, 255, 0.48);
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-surface .playground-tasks-detail-facts-body {
	        flex: 1 1 auto;
	        min-height: 0;
	        display: flex;
	        flex-direction: column;
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-table-shell {
	        flex: 1 1 auto;
	        min-height: 0;
	        overflow: auto;
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-surface .playground-files-state {
	        flex: 1 1 auto;
	        min-height: 180px;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-editor-main.playground-tasks-detail-main.is-secrets-tab,
	      .playground-resources-page.is-develop-server-kind-page .playground-environments-editor-main.playground-tasks-detail-main.is-agent-runtime-threads-tab {
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-detail-scroll.playground-environments-editor-scroll.is-secrets-tab,
	      .playground-resources-page.is-develop-server-kind-page .playground-environments-detail-scroll.playground-environments-editor-scroll.is-agent-runtime-threads-tab {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-secrets-tab,
	      .playground-server-detail-content.is-agent-runtime-threads-tab {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        gap: 12px;
	      }

	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-surface.playground-server-details-card,
	      .playground-server-detail-content.is-agent-runtime-threads-tab .playground-auth-users-surface.playground-server-details-card {
	        flex: 1 1 auto;
	        min-height: 0;
	        margin-bottom: 0;
	      }

	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-surface .playground-tasks-detail-facts-body,
	      .playground-server-detail-content.is-agent-runtime-threads-tab .playground-auth-users-surface .playground-tasks-detail-facts-body {
	        flex: 1 1 auto;
	        min-height: 0;
	        display: flex;
	        flex-direction: column;
	      }

	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-table-shell,
	      .playground-server-detail-content.is-agent-runtime-threads-tab .playground-auth-users-table-shell {
	        flex: 1 1 auto;
	        min-height: 0;
	        overflow: auto;
	      }

	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-surface .playground-files-state,
	      .playground-server-detail-content.is-agent-runtime-threads-tab .playground-auth-users-surface .playground-files-state {
	        flex: 1 1 auto;
	        min-height: 180px;
	      }

	      .playground-resources-page.is-develop-server-kind-page.is-auth-users-tab,
	      .playground-resources-page.is-develop-server-kind-page.is-secrets-tab {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page > .playground-environments-detail-scroll.playground-settings-detail-scroll.is-auth-users-tab,
	      .playground-resources-page.is-develop-server-kind-page > .playground-environments-detail-scroll.playground-settings-detail-scroll.is-secrets-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        padding-bottom: 24px;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-resources-detail-content.is-auth-users-tab,
	      .playground-resources-page.is-develop-server-kind-page .playground-resources-detail-content.is-secrets-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        display: flex;
	        flex-direction: column;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-editor-main.playground-tasks-detail-main.is-auth-users-tab,
	      .playground-resources-page.is-develop-server-kind-page .playground-environments-editor-main.playground-tasks-detail-main.is-secrets-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-detail-scroll.playground-environments-editor-scroll.is-auth-users-tab,
	      .playground-resources-page.is-develop-server-kind-page .playground-environments-detail-scroll.playground-environments-editor-scroll.is-secrets-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-auth-users-tab,
	      .playground-server-detail-content.is-secrets-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        gap: 12px;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-auth-users-tab > .playground-agents-overview-tabs,
	      .playground-server-detail-content.is-auth-users-tab > .playground-database-storage-location-note,
	      .playground-server-detail-content.is-auth-users-tab > .playground-environments-error,
	      .playground-server-detail-content.is-secrets-tab > .playground-agents-overview-tabs,
	      .playground-server-detail-content.is-secrets-tab > .playground-database-storage-location-note,
	      .playground-server-detail-content.is-secrets-tab > .playground-environments-error {
	        flex: 0 0 auto;
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-toolbar,
	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-toolbar {
	        padding-bottom: 12px;
	        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-surface.playground-server-details-card,
	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-surface.playground-server-details-card {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        margin-bottom: 0;
	        display: flex;
	        flex-direction: column;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-surface .playground-tasks-detail-facts-body,
	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-surface .playground-tasks-detail-facts-body {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        display: flex;
	        flex-direction: column;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-table-shell,
	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-table-shell {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: auto;
	        scrollbar-width: none;
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-table-shell::-webkit-scrollbar,
	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-table-shell::-webkit-scrollbar {
	        display: none;
	      }

	      .playground-server-detail-content.is-auth-users-tab .playground-auth-users-surface .playground-files-state,
	      .playground-server-detail-content.is-secrets-tab .playground-auth-users-surface .playground-files-state {
	        flex: 1 1 0;
	        min-height: 180px;
	      }

	      .playground-server-detail-content.is-payments-detail {
	        gap: 12px;
	      }

	      .playground-server-detail-content.is-payments-detail .playground-payments-detail-card {
	        --playground-project-overview-chart-border: linear-gradient(
	          -10deg,
	          rgba(200, 200, 200, 0.25),
	          rgba(255, 255, 255, 0.1),
	          rgba(255, 255, 255, 0.15),
	          rgba(255, 255, 255, 0.375)
	        );
	        position: relative;
	        margin-bottom: 12px;
	        padding: 20px;
	        border: 0;
	        border-radius: 15px;
	        overflow: hidden;
	        background: transparent;
	        -webkit-backdrop-filter: blur(50px);
	        backdrop-filter: blur(50px);
	      }

	      .playground-server-detail-content.is-payments-detail .playground-payments-detail-card::before {
	        content: "";
	        display: block;
	        pointer-events: none;
	        position: absolute;
	        inset: 0;
	        z-index: 5;
	        border-radius: inherit;
	        padding: 1px;
	        background: var(--playground-project-overview-chart-border);
	        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
	        mask-clip: content-box, border-box;
	        mask-composite: exclude;
	        mask-origin: content-box, border-box;
	        mask-repeat: repeat, repeat;
	        mask-size: auto, auto;
	      }

	      .playground-server-detail-content.is-payments-detail .playground-payments-detail-card > * {
	        position: relative;
	        z-index: 1;
	      }

	      .playground-server-detail-content.is-payments-detail .playground-server-details-card-header {
	        padding-bottom: 12px;
	        margin-bottom: 12px;
	        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	      }

	      .playground-server-detail-content.is-payments-detail .playground-server-details-card-title {
	        color: rgba(255, 255, 255, 0.92);
	        font-size: 14px;
	        font-weight: 400;
	        line-height: 1.3;
	      }

	      .playground-server-detail-content.is-payments-detail .playground-server-details-card-copy {
	        max-width: 700px;
	        color: rgba(255, 255, 255, 0.58);
	        font-size: 12px;
	        line-height: 1.45;
	      }

	      .playground-server-detail-content.is-payments-detail .playground-server-runtime-grid {
	        display: grid;
	        grid-template-columns: repeat(2, minmax(0, 1fr));
	        gap: 0;
	      }

	      .playground-server-detail-content.is-payments-detail .playground-server-runtime-grid .playground-environments-editor-fact-row {
	        min-height: 42px;
	      }

	      .playground-server-detail-content.is-payments-detail .playground-server-status-pill {
	        flex: 0 0 auto;
	        border-radius: 999px;
	      }

	      .playground-database-browser-columns {
	        display: grid;
	        grid-template-columns: minmax(180px, 0.84fr) minmax(220px, 1fr) minmax(0, 1.7fr);
	        min-height: min(420px, calc(100dvh - 260px));
	        height: min(620px, calc(100dvh - 260px));
	        max-height: min(620px, calc(100dvh - 260px));
	        width: 100%;
	      }

	      .playground-database-browser-pane {
	        min-width: 0;
	        min-height: 0;
	        display: flex;
	        flex-direction: column;
	        border-right: 1px solid rgba(255, 255, 255, 0.1);
	      }

	      .playground-database-browser-pane:last-child {
	        border-right: 0;
	      }

	      .playground-database-browser-pane-header {
	        flex: 0 0 auto;
	        min-height: 78px;
	        padding: 10px 14px;
	        display: flex;
	        flex-direction: column;
	        align-items: center;
	        justify-content: space-between;
	        gap: 9px;
	        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	      }

	      .playground-database-browser-pane-title-row {
	        width: 100%;
	        display: flex;
	        align-items: center;
	        justify-content: space-between;
	        gap: 10px;
	      }

	      .playground-database-browser-pane-title {
	        min-width: 0;
	        display: inline-flex;
	        align-items: center;
	        gap: 8px;
	        color: rgba(255, 255, 255, 0.9);
	        font-size: 12px;
	        font-weight: 500;
	        line-height: 1.3;
	      }

	      .playground-database-browser-pane-title svg {
	        flex: 0 0 auto;
	        color: rgba(255, 255, 255, 0.72);
	      }

	      .playground-database-browser-pane-action-row {
	        width: 100%;
	        display: flex;
	        align-items: center;
	        justify-content: space-between;
	        gap: 10px;
	      }

	      .playground-database-browser-pane-menu-shell {
	        position: relative;
	        flex: 0 0 auto;
	      }

	      .playground-database-browser-pane-menu-button {
	        width: 22px;
	        height: 22px;
	        padding: 0;
	        border: 0;
	        border-radius: 0;
	        background: transparent;
	        color: rgba(255, 255, 255, 0.62);
	        display: inline-flex;
	        align-items: center;
	        justify-content: center;
	        cursor: pointer;
	        transition: color 160ms ease;
	      }

	      .playground-database-browser-pane-menu-button:hover:not(:disabled) {
	        color: rgba(255, 255, 255, 0.96);
	      }

	      .playground-database-browser-pane-menu-button:disabled {
	        opacity: 0.36;
	        cursor: default;
	      }

	      .playground-database-browser-pane-menu {
	        position: absolute;
	        top: calc(100% + 8px);
	        right: 0;
	        z-index: 80;
	        min-width: 176px;
	      }

	      .playground-database-browser-pane-menu-item {
	        width: 100%;
	        min-height: 32px;
	        padding: 0 10px;
	        border: 0;
	        border-radius: 8px;
	        background: transparent;
	        color: rgba(255, 255, 255, 0.9);
	        display: flex;
	        align-items: center;
	        justify-content: flex-start;
	        gap: 8px;
	        font-size: 12px;
	        font-weight: 400;
	        line-height: 1.35;
	        text-align: left;
	        cursor: pointer;
	      }

	      .playground-database-browser-pane-menu-item:hover:not(:disabled) {
	        background: rgba(255, 255, 255, 0.08);
	        color: #fff;
	      }

	      .playground-database-browser-pane-menu-item.is-danger {
	        color: rgba(255, 138, 138, 0.94);
	      }

	      .playground-database-browser-pane-menu-item:disabled {
	        opacity: 0.45;
	        cursor: default;
	      }

	      .playground-database-browser-pane-list {
	        flex: 1 1 auto;
	        min-height: 0;
	        overflow: auto;
	        padding: 8px 0;
	        scrollbar-width: none;
	      }

	      .playground-database-browser-pane-list::-webkit-scrollbar,
	      .playground-database-browser-fields-pane .playground-database-browser-fields-body::-webkit-scrollbar,
	      .playground-database-browser-fields-pane .playground-database-browser-json-editor-shell::-webkit-scrollbar {
	        display: none;
	      }

	      .playground-database-browser-pane-row {
	        width: 100%;
	        min-height: 34px;
	        padding: 0 14px;
	        border: 0;
	        border-radius: 0;
	        background: transparent;
	        color: rgba(255, 255, 255, 0.68);
	        display: flex;
	        align-items: center;
	        justify-content: space-between;
	        gap: 8px;
	        text-align: left;
	        cursor: pointer;
	        transition: background-color 160ms ease, color 160ms ease;
	      }

	      .playground-database-browser-pane-row:hover,
	      .playground-database-browser-pane-row:focus-visible {
	        background: rgba(255, 255, 255, 0.05);
	        color: rgba(255, 255, 255, 0.94);
	      }

	      .playground-database-browser-pane-row.is-active {
	        background: rgba(255, 255, 255, 0.08);
	        color: #fff;
	      }

	      .playground-database-browser-pane-row-label {
	        min-width: 0;
	        overflow: hidden;
	        text-overflow: ellipsis;
	        white-space: nowrap;
	        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	        font-size: 12px;
	        line-height: 1.35;
	      }

	      .playground-database-browser-pane-row svg {
	        flex: 0 0 auto;
	        color: rgba(255, 255, 255, 0.48);
	      }

	      .playground-database-browser-pane-empty {
	        padding: 14px;
	        color: rgba(255, 255, 255, 0.5);
	        font-size: 12px;
	        line-height: 1.45;
	      }

	      .playground-database-browser-fields-pane .playground-database-browser-fields-card {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        padding: 0;
	        gap: 0;
	      }

	      .playground-database-browser-fields-pane .playground-database-browser-fields-header {
	        flex: 0 0 auto;
	        min-height: 78px;
	        padding: 10px 14px;
	        flex-direction: column;
	        align-items: stretch;
	        justify-content: space-between;
	        gap: 9px;
	        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	      }

	      .playground-database-browser-fields-pane .playground-database-browser-fields-body {
	        flex: 1 1 auto;
	        min-height: 0;
	        overflow: auto;
	        padding: 14px 16px;
	        scrollbar-width: none;
	      }

	      .playground-database-browser-fields-pane .playground-database-browser-json-editor-shell {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: auto;
	        scrollbar-width: none;
	      }

	      .playground-database-browser-fields-pane .playground-files-state {
	        flex: 1 1 auto;
	        min-height: 180px;
	      }

	      @media (max-width: 920px) {
	        .playground-database-browser-columns {
	          grid-template-columns: 1fr;
	        }

	        .playground-database-browser-pane {
	          min-height: 220px;
	          border-right: 0;
	          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	        }

	        .playground-database-browser-pane:last-child {
	          border-bottom: 0;
	        }
	      }

	      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-facts {
	        overflow: visible;
	        border: 0;
        border-radius: 10px;
        background: transparent;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-connectors {
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(50px);
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-skills {
        margin-bottom: 14px;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-facts::before {
        content: "";
        display: block;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-connectors::before {
        content: "";
        display: block;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-connectors > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-facts > * {
        position: relative;
        z-index: 1;
      }

      .playground-tasks-detail-facts .playground-tasks-detail-section-title {
        margin-bottom: 6px;
      }

      .playground-tasks-detail-facts.is-popover-open {
        z-index: 220;
      }

      .playground-tasks-detail-facts-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 5px;
        margin-bottom: 5px;
      }

      .playground-tasks-detail-facts-header .playground-tasks-detail-section-title {
        margin-top: 0;
        margin-bottom: 0;
      }

      .playground-tasks-detail-facts-toggle {
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.46);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 160ms ease;
      }

      .playground-tasks-detail-facts-toggle:hover {
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-tasks-detail-facts-toggle svg {
        width: 14px;
        height: 14px;
        transition: transform 160ms ease;
      }

      .playground-tasks-detail-facts-toggle.is-collapsed svg {
        transform: rotate(-90deg);
      }

      .playground-tasks-detail-facts-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-skills-detail-page .playground-tasks-detail-facts-body {
        gap: 10px;
      }

      .playground-mission-control-status-overview {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 6px 0 10px;
      }

      .playground-mission-control-status-metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .playground-mission-control-status-metric {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .playground-mission-control-status-value {
        font-size: 17px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: -0.02em;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-mission-control-status-label {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        line-height: 1.2;
        font-weight: 400;
        color: #fff;
        white-space: nowrap;
      }

      .playground-mission-control-status-label svg {
        width: 12px;
        height: 12px;
        flex: 0 0 auto;
      }

      .playground-mission-control-status-label.is-total svg {
        color: rgba(137, 126, 255, 0.92);
      }

      .playground-mission-control-status-label.is-backlog svg {
        color: rgba(120, 111, 255, 0.92);
      }

      .playground-mission-control-status-label.is-in-progress svg {
        color: rgba(170, 138, 255, 0.94);
      }

      .playground-mission-control-status-label.is-done svg {
        color: rgba(237, 170, 255, 0.94);
      }

      .playground-mission-control-status-bar {
        position: relative;
        display: flex;
        align-items: stretch;
        width: 100%;
        height: 58px;
        overflow: hidden;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.06);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .playground-mission-control-status-bar::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.04));
        mix-blend-mode: screen;
      }

      .playground-mission-control-status-bar.is-empty {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-mission-control-status-segment {
        position: relative;
        min-width: 0;
        height: 100%;
      }

      .playground-mission-control-status-segment::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0) 52%),
          repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.16) 0 2px,
            rgba(255, 255, 255, 0) 2px 54px
          );
        pointer-events: none;
      }

      .playground-mission-control-status-segment + .playground-mission-control-status-segment {
        box-shadow: inset 2px 0 0 rgba(255, 255, 255, 0.18);
      }

      .playground-mission-control-status-segment.is-backlog {
        background: linear-gradient(90deg, rgba(102, 95, 230, 0.92) 0%, rgba(124, 110, 238, 0.9) 100%);
      }

      .playground-mission-control-status-segment.is-in-progress {
        background: linear-gradient(90deg, rgba(150, 119, 242, 0.92) 0%, rgba(181, 141, 248, 0.9) 100%);
      }

      .playground-mission-control-status-segment.is-done {
        background: linear-gradient(90deg, rgba(221, 161, 252, 0.9) 0%, rgba(243, 182, 246, 0.92) 100%);
      }
`;
