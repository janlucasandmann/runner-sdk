export const PROJECTS_CORE_CSS_03_FRAGMENT = `	        margin-bottom: 24px;
		      }

		      .playground-new-issue-modal.platform-modal-surface {
		        display: flex;
		        flex-direction: column;
		      }

		      .playground-new-issue-modal__body.platform-modal-body {
		        min-height: 0;
		        flex: 1 1 auto;
		        display: flex;
		        flex-direction: column;
		        gap: 20px;
		        overflow-x: hidden;
		        overflow-y: auto;
		      }

		      .playground-new-issue-modal > .platform-modal-header,
		      .playground-new-issue-modal > .platform-modal-footer {
		        flex: 0 0 auto;
		      }

		      .playground-new-issue-modal .playground-tasks-issue-details-section {
		        margin-top: 0;
		        padding: 0;
		        border: 0;
		        border-radius: 0;
		        background: transparent;
		        -webkit-backdrop-filter: none;
		        backdrop-filter: none;
		      }

		      .playground-new-issue-modal .playground-tasks-issue-details-section > .playground-tasks-detail-facts-body {
		        margin-top: 0;
		        padding-top: 0;
		        border-top: 0;
		      }

		      .playground-new-issue-modal .playground-new-issue-modal__description.platform-instructions-editor {
		        margin-top: 0;
		        margin-bottom: 0;
		        min-height: 0;
		        flex: 1 1 auto;
		        display: flex;
		        flex-direction: column;
		        padding: 12px;
		        border: 1px solid rgba(255, 255, 255, 0.075);
		        border-radius: 10px;
		        background: rgba(255, 255, 255, 0.075);
		        overflow: hidden;
		      }

		      .playground-new-issue-modal .playground-new-issue-modal__description.platform-instructions-editor > .platform-instructions-editor__header {
		        flex: 0 0 auto;
		        margin-bottom: 12px;
		      }

		      .playground-new-issue-modal .playground-new-issue-modal__description.platform-instructions-editor > .platform-instructions-editor__body {
		        min-height: 36px;
		        flex: 1 1 auto;
		        overflow-x: hidden;
		        overflow-y: auto;
		        overscroll-behavior: contain;
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

      .playground-tasks-comment-modal-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 0;
        padding-top: 0;
      }

      .playground-tasks-comment-modal-instructions {
        width: 100%;
        min-height: 180px;
        margin: 0;
      }

      .playground-tasks-comment-modal-instructions .platform-instructions-editor__title {
        font-size: 14px;
      }

      .playground-tasks-comment-modal-instructions .platform-instructions-editor__body,
      .playground-tasks-comment-modal-instructions .platform-instructions-editor__preview,
      .playground-tasks-comment-modal-instructions .platform-instructions-editor__prosemirror {
        min-height: 140px;
      }

      .playground-tasks-comment-modal .playground-tasks-comment-feedback {
        padding: 0;
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

      .playground-tasks-detail-fact-control .playground-tasks-detail-central-selector {
        width: 100%;
        max-width: 100%;
        justify-content: flex-end;
      }

      .playground-tasks-detail-central-selector .playground-tasks-detail-central-selector-trigger {
        width: 100%;
        min-height: 30px;
        justify-content: flex-end;
        gap: 6px;
        color: rgba(255, 255, 255, 0.86);
        text-align: right;
      }

      .playground-tasks-detail-central-selector.is-empty .playground-tasks-detail-central-selector-trigger {
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-tasks-detail-central-selector .platform-selector__value {
        justify-content: flex-end;
      }

      .playground-tasks-detail-type-badge {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 18px;
        border-radius: 5px;
        color: #fff;
      }

      .playground-tasks-detail-type-badge svg {
        width: 10px;
        height: 10px;
        filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.28));
      }

      .playground-tasks-detail-type-badge.is-task {
        background: linear-gradient(180deg, #39b877 0%, #2b8b59 100%);
      }

      .playground-tasks-detail-type-badge.is-subtask {
        background: linear-gradient(180deg, #4f7fc5 0%, #1e4585 100%);
      }

      .playground-tasks-detail-type-badge.is-loop {
        background: linear-gradient(180deg, #9a72df 0%, #6542a8 100%);
      }

      .playground-tasks-status-value {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-tasks-status-icon {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
      }

      .playground-tasks-status-icon.is-backlog,
      .playground-tasks-status-icon.is-canceled {
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-tasks-status-icon.is-todo {
        color: #fff;
      }

      .playground-tasks-status-icon.is-in-progress {
        color: #f5c518;
      }

      .playground-tasks-status-icon.is-done {
        color: #747ce8;
      }

      .playground-tasks-status-icon.is-blocked {
        color: #ff6b6b;
      }

      .playground-tasks-status-icon.is-in-review {
        color: #4da3ff;
      }

      .playground-tasks-status-value-label {
        min-width: 0;
      }

      .playground-tasks-detail-creator-value .playground-tasks-detail-select-trigger-label {
        color: rgba(255, 255, 255, 0.82);
        font-size: 12px;
        font-weight: 400;
      }

      .playground-tasks-detail-central-selector-popup {
        width: min(280px, calc(100vw - 48px));
      }

      .playground-tasks-detail-assignee-mode-switch.platform-switch {
        width: 100%;
        min-width: 0;
      }

      .playground-tasks-detail-assignee-mode-switch .platform-switch__option {
        flex: 1 1 0;
      }

      .playground-tasks-schedule-selector-popup {
        width: min(320px, calc(100vw - 48px));
      }

      .playground-tasks-schedule-panel.is-centralized-selector-content {
        position: relative;
        inset: auto;
        width: 100%;
        max-width: none;
        overflow: visible;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        animation: none;
        transform: none;
      }

      .playground-tasks-schedule-type-switch.platform-switch {
        width: 100%;
        min-width: 0;
      }

      .playground-tasks-schedule-type-switch .platform-switch__option {
        flex: 1 1 0;
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
