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

      .playground-tasks-unified-navbar.is-ticket-detail {
        grid-template-columns: minmax(0, 1fr) 0 auto;
      }

      .playground-tasks-unified-navbar.is-ticket-detail
        .playground-top-nav-path-item.is-current,
      .playground-tasks-unified-navbar.is-ticket-detail
        .playground-top-nav-path-item-group.is-current {
        max-width: min(720px, 60vw);
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
        width: min(100%, var(--platform-page-content-max-width, 87.5rem));
        max-width: var(--platform-page-content-max-width, 87.5rem);
        margin-left: auto;
        margin-right: auto;
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
	        border-bottom: 0;
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

      .playground-tasks-ticket-screen-panel .playground-tasks-comment-dock {
        margin-top: auto;
        padding-bottom: 0;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-comments > .playground-tasks-comment-dock {
        margin-top: 12px;
        padding: 0;
        background: transparent;
      }

      .playground-ticket-detail-frame {
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        overflow: hidden;
      }

      .playground-ticket-detail-page {
        height: 100%;
        min-height: 0;
        grid-template-rows: minmax(0, 1fr);
        row-gap: 0;
        align-items: stretch;
      }

      .playground-ticket-detail-page.has-header {
        grid-template-rows: auto minmax(0, 1fr);
        row-gap: 12px;
      }

      .playground-ticket-detail-page.is-sidebar-collapsed {
        grid-template-columns: minmax(0, 1fr) minmax(0, 0);
      }

      .playground-ticket-detail-header,
      .playground-ticket-detail-header .resource-detail-page__header-content,
      .playground-ticket-detail-header .playground-tasks-detail-navbar {
        width: 100%;
        min-width: 0;
      }

      .playground-ticket-detail-content {
        min-height: 0;
        height: 100%;
        overflow: hidden;
        gap: 0;
      }

      .playground-ticket-detail-content
        .platform-instructions-editor.playground-tasks-detail-description {
        margin-top: 0;
        margin-bottom: 0;
        padding-bottom: 3px;
      }

      .playground-ticket-detail-content
        .platform-instructions-editor.is-minimalistic-ui
        .platform-instructions-editor__header {
        background: #000;
      }

      .playground-ticket-detail-content .platform-instructions-editor__title {
        flex: 1 1 auto;
        font-size: 18px;
      }

      .playground-tasks-ticket-editor-title-input {
        box-sizing: border-box;
        display: block;
        width: 100%;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        line-height: inherit;
      }

      .playground-ticket-detail-content > .playground-tasks-detail-main {
        width: 100%;
        height: 100%;
      }

      .playground-tasks-ticket-screen-panel
        .playground-ticket-detail-content
        .playground-environments-detail-scroll.playground-tasks-detail-scroll {
        padding-top: 0 !important;
      }

      .playground-content-body.is-tasks-page
        .playground-environments-page.playground-tasks-ticket-screen:not(.playground-agents-page)
        .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll {
        padding-right: 50px !important;
      }

      .playground-ticket-detail-sidebar.playground-agents-detail-sidebar.playground-project-overview-sidebar {
        position: relative;
        top: auto;
        align-self: start;
        min-height: 0;
        max-height: 100%;
        margin-top: 0;
        padding-top: 0;
        overflow-x: visible;
        overflow-y: auto;
        scrollbar-width: none;
      }

      .playground-ticket-detail-sidebar::-webkit-scrollbar {
        display: none;
      }

      .playground-ticket-detail-sidebar.is-popover-open,
      .playground-ticket-detail-sidebar-section:has(.is-popover-open) {
        z-index: 30;
      }

      .playground-ticket-detail-sidebar-section.platform-ui-card.is-sidebar {
        overflow: visible;
        box-shadow: none;
      }

      .playground-ticket-detail-sidebar .is-centralized-sidebar-content {
        position: relative;
        min-width: 0;
        margin: 0;
        padding: 0;
        overflow: visible;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      .playground-ticket-detail-sidebar .is-centralized-sidebar-content::before {
        content: none;
        display: none;
      }

      .playground-ticket-detail-sidebar .playground-tasks-detail-fact.is-assignee {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-ticket-detail-sidebar .playground-tasks-detail-work-control,
      .playground-ticket-detail-sidebar .playground-tasks-detail-work-selector,
      .playground-ticket-detail-sidebar .playground-tasks-detail-work-selector .platform-button-selector__group {
        width: 100%;
      }

      .playground-ticket-detail-sidebar .playground-tasks-detail-work-control {
        margin-top: 8px;
      }

      .playground-ticket-detail-sidebar .playground-tasks-detail-work-selector .platform-button-selector__action {
        flex: 1 1 auto;
        justify-content: center;
      }

      .playground-ticket-detail-sidebar .playground-tasks-detail-threads-section.is-centralized-sidebar-content {
        gap: 0;
      }

      .playground-ticket-detail-attachment-sidebar-body {
        min-width: 0;
        min-height: 0;
        padding: 0;
        overflow: hidden;
      }

      .playground-ticket-detail-attachment-sidebar-body > .playground-tasks-detail-preview-host {
        width: 100%;
        height: 100%;
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
        display: flex;
        width: 100%;
        flex-direction: column;
      }

      .playground-tasks-ticket-thread-divider {
        width: 100%;
        height: 1px;
        flex: 0 0 1px;
        margin: 12px 0;
        background: rgba(255, 255, 255, 0.1);
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

      .playground-tasks-ticket-subtasks {
        margin-top: 12px;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-activity {
        box-sizing: border-box;
        align-self: stretch;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        margin-top: 0;
        padding-top: 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-activity-comment-attachments {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 8px;
        margin-top: 10px;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-comments-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-comments-toolbar {
        margin-bottom: 24px;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-comments-list {
        gap: 24px;
      }

      .playground-tasks-ticket-screen-panel .playground-tasks-comments-toolbar .playground-tasks-detail-section-title {
        margin: 0;
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

      .playground-tasks-main-scroll.is-projects-home.has-resource-overview {
        padding: 0;
        overflow: hidden;
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

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 18px;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card {
        position: relative;
        z-index: 0;
        display: flex;
        min-width: 0;
        min-height: 302px;
        overflow: visible;
        cursor: pointer;
        border: 0;
        border-radius: 10px;
        background: transparent;
        isolation: isolate;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card::before {
        content: none;
        display: none;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card:hover,
      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card:focus-visible,
      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card:focus-within {
        z-index: 4;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card:focus-visible {
        outline: 1px solid rgba(77, 163, 255, 0.9);
        outline-offset: 3px;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-hero {
        position: relative;
        min-height: 0;
        aspect-ratio: 1.45 / 1;
        padding: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px 10px 0 0;
        background: color-mix(in srgb, var(--project-icon-color) 18%, transparent);
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-top {
        position: absolute;
        z-index: 5;
        inset: 10px 10px auto auto;
        margin: 0;
        display: block;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-actions {
        position: relative;
        z-index: 6;
        opacity: 0;
        transition: opacity 140ms ease;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card:hover .playground-tasks-project-card-actions,
      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card:focus-within .playground-tasks-project-card-actions {
        opacity: 1;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-actions .playground-files-header-icon-button {
        background: rgba(0, 0, 0, 0.38);
        -webkit-backdrop-filter: blur(16px);
        backdrop-filter: blur(16px);
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-icon {
        position: relative;
        width: 64px;
        height: 64px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--project-icon-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        filter: none;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-icon::before {
        content: none;
        display: none;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-icon > span {
        font-size: 30px;
        line-height: 1;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-body {
        min-height: 148px;
        padding: 20px 20px 18px;
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        gap: 0;
        border-radius: 0 0 10px 10px;
        background: #242426;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-title {
        overflow: hidden;
        color: rgba(255, 255, 255, 0.98);
        font-size: 16px;
        font-weight: 400;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-copy {
        max-width: none;
        max-height: calc(1.5em * 2);
        margin-top: 12px;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.58);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-copy .tb-message-markdown-paragraph,
      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-copy .tb-message-markdown-list,
      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-copy .tb-message-markdown-heading {
        margin: 0;
        color: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
      }

      .playground-projects-overview-surface.is-card-grid .playground-tasks-project-card-creator {
        margin-top: auto;
        padding-top: 24px;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.38);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @media (max-width: 1360px) {
        .playground-projects-overview-surface.is-card-grid .playground-tasks-project-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 980px) {
        .playground-projects-overview-surface.is-card-grid .playground-tasks-project-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 640px) {
        .playground-projects-overview-surface.is-card-grid .playground-tasks-project-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .playground-projects-library-header {
        gap: 12px;
      }

      .playground-projects-library-title-row {
        align-items: center;
      }

      .playground-projects-library-heading {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-projects-library-search {
        width: 300px;
      }

      .playground-projects-library-controls .playground-projects-library-filter-menu {
        right: auto;
        left: 0;
        top: calc(100% + 8px);
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
        transition: width 220ms ease, max-width 220ms ease;
      }

      .playground-project-workspace-inner.is-backlog-work-view {
        width: min(100%, var(--playground-thread-content-max-width));
        max-width: var(--playground-thread-content-max-width);
      }

      .playground-project-workspace-inner.is-board-work-view {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
      }

      .playground-content-body.is-tasks-page
        .playground-environments-page.playground-tasks-project-workspace
        .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-activity {
        padding: 0 !important;
        gap: 0;
        overflow: hidden;
      }

      .playground-project-workspace-inner.is-activity-work-view {
        width: 100%;
        height: 100%;
        max-width: none;
        min-height: 0;
        margin: 0;
        gap: 0;
      }

      .playground-project-activity-page,
      .playground-project-workspace-inner.is-activity-work-view
        > .playground-project-activity-page {
        width: 100%;
        max-width: none;
        min-width: 0;
      }

      .playground-project-activity-page {
        display: grid;
        flex: 1 1 auto;
        grid-template-rows: repeat(2, minmax(0, 1fr));
        height: 100%;
        min-height: 0;
        overflow: hidden;
        background: #000;
      }

      .playground-project-activity-page
        > .platform-activity-overview.playground-project-activity-overview {
        height: 100%;
        min-height: 0;
      }

      .playground-project-activity-feed {
        box-sizing: border-box;
        display: flex;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        padding: 0;
      }

      .playground-project-activity-feed-loading {
        flex: 1 1 auto;
        min-height: 220px;
      }

      .platform-activity-timeline.is-inspector.playground-project-activity-timeline {
        flex: 1 1 auto;
        width: 100%;
        max-width: none;
        height: 100%;
        min-height: 0;
      }

      .playground-project-activity-preview {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        gap: 28px;
      }

      .playground-project-activity-preview-heading {
        display: flex;
        align-items: center;
        min-width: 0;
        gap: 12px;
      }

      .playground-project-activity-preview-avatar {
        width: 32px;
        height: 32px;
        flex: 0 0 32px;
        overflow: hidden;
        border-radius: 50%;
      }

      .playground-project-activity-preview-avatar > * {
        width: 100% !important;
        height: 100% !important;
      }

      .playground-project-activity-preview-avatar img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      }

      .playground-project-activity-preview-heading-copy {
        min-width: 0;
      }

      .playground-project-activity-preview-summary {
        color: rgba(255, 255, 255, 0.82);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.45;
      }

      .playground-project-activity-preview-summary strong {
        color: #fff;
        font-weight: 400;
      }

      .playground-project-activity-preview-time {
        display: block;
        margin-top: 3px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-project-activity-preview-details {
        display: grid;
        grid-template-columns: minmax(96px, 140px) minmax(0, 1fr);
        align-items: center;
        width: 100%;
        min-width: 0;
        margin: 0;
      }

      .playground-project-activity-preview-row {
        display: contents;
      }

      .playground-project-activity-preview-row dt,
      .playground-project-activity-preview-row dd {
        box-sizing: border-box;
        min-width: 0;
        margin: 0;
        padding: 11px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-project-activity-preview-row dt {
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-project-activity-preview-row dd {
        overflow-wrap: anywhere;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-project-activity-preview-row.is-code dd {
        color: rgba(255, 255, 255, 0.58);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
      }

      .playground-project-activity-preview-ticket {
        max-width: 100%;
        padding: 0;
        overflow: hidden;
        border: 0;
        color: #fff;
        background: transparent;
        font: inherit;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }

      .playground-project-activity-preview-ticket:hover,
      .playground-project-activity-preview-ticket:focus-visible {
        text-decoration: underline;
      }

      @media (max-width: 760px) {
        .playground-project-activity-feed {
          padding: 0;
        }

        .playground-project-activity-preview-details {
          grid-template-columns: 92px minmax(0, 1fr);
        }
      }

      .playground-project-workspace-inner.is-backlog-work-view > .playground-tasks-backlog-view {
        width: 100%;
        max-width: 100%;
      }

      .playground-project-workspace-inner > .playground-tasks-view-section,
      .playground-project-workspace-inner > .playground-tasks-backlog-view,
      .playground-project-workspace-inner > .playground-tasks-loading-state,
      .playground-project-workspace-inner > .playground-tasks-empty,
      .playground-project-workspace-inner > .playground-environments-error {
        width: 100%;
      }

      .playground-content-body.is-tasks-page
        .playground-environments-page.playground-tasks-project-workspace:not(.playground-agents-page)
        .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-board {
        padding-bottom: 24px;
      }

      .playground-tasks-backlog-header.is-backlog-list-header {
        gap: 0;
      }

      .playground-tasks-backlog-header.is-board-list-header {
        gap: 0;
      }

      .playground-project-work-view-tabs.platform-detail-tab-bar {
        width: auto;
        flex: 0 0 auto;
      }

      .playground-tasks-backlog-header.is-backlog-list-header
        .playground-tasks-backlog-heading,
      .playground-tasks-backlog-header.is-board-list-header
        .playground-tasks-backlog-heading {
        font-weight: 400;
      }

      .playground-tasks-backlog-header.is-backlog-list-header
        .playground-tasks-backlog-header-main,
      .playground-tasks-backlog-header.is-board-list-header
        .playground-tasks-backlog-header-main {
        gap: 8px;
      }

      .playground-tasks-project-workspace
        .playground-tasks-backlog-view
        .playground-tasks-backlog-item {
        border-color: rgba(255, 255, 255, 0.075);
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-tasks-backlog-header-actions {
        min-width: 0;
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      .playground-tasks-backlog-central-search.platform-search,
      .playground-tasks-board-central-search.platform-search {
        width: 300px;
        min-width: 300px;
        flex: 0 0 300px;
      }

      .playground-tasks-backlog-filter-shell.is-central-popup,
      .playground-tasks-board-filter-shell.is-central-popup {
        display: inline-flex;
      }

      .playground-tasks-backlog-filter-menu.is-central-popup,
      .playground-tasks-board-filter-menu.is-central-popup {
        width: 280px;
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

      .playground-tasks-progressive-list-loading {
        min-height: 48px;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        grid-column: 1 / -1;
      }

      @media (max-width: 760px) {
        .playground-tasks-backlog-header.is-backlog-list-header
          .playground-tasks-backlog-header-row,
        .playground-tasks-backlog-header.is-board-list-header
          .playground-tasks-backlog-header-row {
          align-items: stretch;
          flex-direction: column;
        }

        .playground-tasks-backlog-header-actions {
          width: 100%;
        }

        .playground-tasks-backlog-central-search.platform-search,
        .playground-tasks-board-central-search.platform-search {
          width: 100%;
          min-width: 0;
          flex: 1 1 auto;
        }
      }

`;
