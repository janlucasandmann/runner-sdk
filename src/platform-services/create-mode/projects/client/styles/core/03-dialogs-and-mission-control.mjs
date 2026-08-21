export const PROJECTS_CORE_CSS_03_FRAGMENT = `	        margin-bottom: 24px;
		      }

		      .playground-project-create-modal.platform-modal-surface {
		        display: flex;
		        flex-direction: column;
		      }

		      .playground-project-create-modal > .platform-modal-header,
		      .playground-project-create-modal > .platform-modal-footer {
		        flex: 0 0 auto;
		      }

		      .playground-project-create-modal__body.platform-modal-body {
		        min-height: 0;
		        flex: 1 1 auto;
		        display: flex;
		        flex-direction: column;
		        gap: 16px;
		        overflow-x: hidden;
		        overflow-y: auto;
		      }

		      .playground-project-create-modal__description-editor.platform-instructions-editor {
		        margin: 0;
		      }

		      .playground-project-create-modal__description-editor .platform-instructions-editor__prosemirror {
		        min-height: 96px;
		      }

		      .playground-project-create-modal .playground-tasks-project-initial-setup-field.is-inline {
		        display: flex;
		        justify-content: space-between;
		        align-items: center;
		        gap: 16px;
		      }

		      .playground-project-create-modal .playground-tasks-project-initial-setup-field.is-inline .playground-tasks-project-initial-setup-label {
		        white-space: nowrap;
		      }

		      .playground-project-create-modal .playground-tasks-project-initial-setup-field .playground-tasks-project-modal-environment-picker {
		        width: auto;
		        min-width: 0;
		        margin-left: auto;
		        display: flex;
		        align-items: center;
		        justify-content: flex-end;
		      }

		      .playground-project-create-modal .playground-tasks-project-modal-computer-selector {
		        margin-left: auto;
		      }

		      .playground-project-create-modal .playground-tasks-project-modal-computer-selector-value {
		        min-width: 0;
		        display: inline-flex;
		        align-items: center;
		        justify-content: flex-end;
		        gap: 8px;
		      }

		      .playground-project-create-modal__identity {
		        min-width: 0;
		        display: flex;
		        align-items: center;
		        gap: 16px;
		      }

		      .playground-project-create-modal__identity .playground-tasks-project-modal-name-row {
		        flex: 1 1 auto;
		      }

		      .playground-project-create-modal__identity .playground-tasks-project-modal-environment-picker {
		        flex: 0 1 240px;
		      }

		      @media (max-width: 640px) {
		        .playground-project-create-modal__identity {
		          align-items: stretch;
		          flex-direction: column;
		        }

		        .playground-project-create-modal__identity .playground-tasks-project-modal-environment-picker,
		        .playground-project-create-modal__identity .playground-tasks-detail-select-shell {
		          width: 100%;
		          max-width: none;
		        }
		      }

		      .playground-project-milestone-modal.platform-modal-surface {
		        display: flex;
		        flex-direction: column;
		      }

		      .playground-project-milestone-modal > .platform-modal-header,
		      .playground-project-milestone-modal > .platform-modal-footer {
		        flex: 0 0 auto;
		      }

		      .playground-project-milestone-modal__body.platform-modal-body {
		        min-height: 0;
		        flex: 1 1 auto;
		        overflow-x: hidden;
		        overflow-y: auto;
		      }

		      .playground-project-milestone-modal__body .playground-mission-control-modal-context {
		        overflow: visible;
		        padding-right: 0;
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

		      .playground-new-issue-modal > .platform-modal-header.is-search {
		        gap: 10px;
		      }

		      .playground-new-issue-modal > .platform-modal-header .platform-modal-header__leading {
		        overflow: visible;
		      }

		      .playground-new-issue-modal__type-selector {
		        flex: 0 0 auto;
		      }

		      .playground-new-issue-modal__type-selector .playground-new-issue-modal__type-selector-trigger {
		        width: 24px;
		        min-height: 32px;
		        justify-content: center;
		        padding: 0;
		      }

		      .playground-new-issue-modal__type-selector .platform-selector__value {
		        overflow: visible;
		      }

		      .playground-new-issue-modal__type-selector .platform-selector__chevrons {
		        display: none;
		      }

		      .playground-new-issue-modal__type-selector-trigger:hover .playground-new-issue-modal__type-trigger-icon {
		        filter: brightness(1.08);
		      }

		      .playground-new-issue-modal__type-selector-trigger:focus-visible .playground-new-issue-modal__type-trigger-icon {
		        outline: 1px solid rgba(255, 255, 255, 0.55);
		        outline-offset: 2px;
		      }

		      .playground-new-issue-modal__type-selector-popup.platform-selector__popup {
		        min-width: 180px;
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

		      .playground-new-issue-modal__loop-goal-section {
		        display: flex;
		        min-height: 0;
		        flex: 1 1 auto;
		        flex-direction: column;
		        border: 1px solid rgba(255, 255, 255, 0.075);
		        border-radius: 10px;
		        background: rgba(255, 255, 255, 0.075);
		        overflow: hidden;
		      }

		      .playground-new-issue-modal__loop-goal-section > .playground-new-issue-modal__description.platform-instructions-editor {
		        border: 0;
		        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
		        border-radius: 0;
		        background: transparent;
		      }

		      .playground-new-issue-modal__loop-fields {
		        display: grid;
		        flex: 0 0 auto;
		        grid-template-columns: repeat(4, minmax(170px, 1fr));
		        gap: 16px;
		        padding: 12px;
		        overflow-x: auto;
		      }

		      .playground-new-issue-modal__loop-field {
		        display: flex;
		        min-height: 30px;
		        min-width: 0;
		        align-items: center;
		        justify-content: flex-start;
		        gap: 4px;
		        color: rgba(255, 255, 255, 0.5);
		        font-size: 12px;
		        font-weight: 400;
		        white-space: nowrap;
		      }

		      .playground-new-issue-modal__loop-field input {
		        width: 4ch;
		        min-width: 0;
		        flex: 0 0 4ch;
		        order: -1;
		        box-sizing: border-box;
		        border: 0;
		        border-radius: 0;
		        outline: 0;
		        background: transparent;
		        color: #fff;
		        font: inherit;
		        font-size: 12px;
		        line-height: 1.45;
		        min-height: 0;
		        padding: 0;
		        text-align: left;
		        -moz-appearance: textfield;
		        appearance: textfield;
		      }

		      .playground-new-issue-modal__loop-field input::-webkit-inner-spin-button,
		      .playground-new-issue-modal__loop-field input::-webkit-outer-spin-button {
		        margin: 0;
		        -webkit-appearance: none;
		        appearance: none;
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

	      .playground-resources-page.is-develop-server-kind-page.is-database-data-tab
	        > .playground-environments-detail-scroll.playground-settings-detail-scroll.is-database-data-tab {
	        width: 100%;
	        min-width: 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        padding: 0;
	        gap: 0;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page.is-database-data-tab
	        .playground-resources-detail-content.is-database-data-tab,
	      .playground-resources-page.is-develop-server-kind-page.is-database-data-tab
	        .playground-database-detail-main.is-database-data-tab,
	      .playground-resources-page.is-develop-server-kind-page.is-database-data-tab
	        .playground-environments-detail-scroll.playground-environments-editor-scroll.is-database-data-tab {
	        box-sizing: border-box;
	        width: 100%;
	        max-width: none;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        margin: 0;
	        padding: 0;
	        gap: 0;
	        flex: 1 1 0;
	        overflow: hidden;
	      }

	      .playground-server-detail-page.is-database-server-detail.is-database-data-tab {
	        box-sizing: border-box;
	        width: 100%;
	        max-width: none;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        margin: 0;
	        grid-template-rows: minmax(0, 1fr);
	        row-gap: 0;
	        align-items: stretch;
	      }

	      .playground-server-detail-page.is-database-server-detail.is-database-data-tab
	        > .resource-detail-page__content.playground-database-detail-content.is-database-data-tab {
	        box-sizing: border-box;
	        width: 100%;
	        max-width: none;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        margin: 0;
	        gap: 0;
	        flex: 1 1 0;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-surface.playground-server-details-card {
	        flex: 1 1 0;
	        box-sizing: border-box;
	        width: 100%;
	        max-width: none;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        margin: 0;
	        display: flex;
	        flex-direction: column;
	        padding: 0;
	        border: 0;
	        border-radius: 0;
	        background: transparent;
	        overflow: hidden;
	        -webkit-backdrop-filter: none;
	        backdrop-filter: none;
	      }

	      .playground-server-detail-content.is-database-data-tab
	        .playground-database-browser-surface.playground-server-details-card::before {
	        content: none;
	        display: none;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-tab-body {
	        flex: 1 1 0;
	        box-sizing: border-box;
	        width: 100%;
	        max-width: none;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        display: flex;
	        flex-direction: column;
	        gap: 12px;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-columns {
	        flex: 1 1 0;
	        width: 100%;
	        max-width: none;
	        min-height: 0;
	        height: 100%;
	        max-height: none;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-pane,
	      .playground-server-detail-content.is-database-data-tab .playground-database-browser-fields-card {
	        min-height: 0;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab > .playground-agents-overview-tabs,
	      .playground-server-detail-content.is-database-data-tab > .playground-environments-error {
	        flex: 0 0 auto;
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
	        --playground-database-browser-column-inline-padding: 20px;
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
	        padding: 10px var(--playground-database-browser-column-inline-padding);
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
	        padding: 0 var(--playground-database-browser-column-inline-padding);
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

	      .playground-database-browser-pagination-loading {
	        box-sizing: border-box;
	        width: 100%;
	        min-height: 42px;
	        padding: 8px var(--playground-database-browser-column-inline-padding);
	        justify-content: center;
	        color: rgba(255, 255, 255, 0.62);
	      }

	      .playground-database-browser-pane-empty {
	        flex: 1 1 auto;
	        box-sizing: border-box;
	        width: 100%;
	        min-height: 160px;
	        margin: 0;
	        padding: 24px var(--playground-database-browser-column-inline-padding);
	      }

	      .playground-database-browser-pane-empty .platform-empty-state__description {
	        max-width: 220px;
	      }

	      .playground-database-browser-pane-list > .playground-database-browser-pane-empty {
	        min-height: 100%;
	      }

	      .playground-database-browser-fields-empty-state {
	        min-height: 180px;
	      }

	      .playground-database-browser-fields-body > .playground-database-browser-fields-empty-state {
	        min-height: 100%;
	        padding-inline: 0;
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
	        padding: 10px var(--playground-database-browser-column-inline-padding);
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
	        padding: 14px var(--playground-database-browser-column-inline-padding);
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

      .playground-tasks-detail-agent-runs-value {
        gap: 8px;
      }

      .playground-tasks-detail-agent-runs-value:disabled {
        cursor: default;
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

      .playground-tasks-detail-type-badge.is-loop,
      .playground-tasks-backlog-project-icon.is-loop,
      .playground-tasks-lane-card-type-badge.is-loop {
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

      .playground-mission-control-delivery-card.platform-ui-card {
        margin-top: 16px;
      }

      .playground-mission-control-delivery-status {
        display: inline-flex;
        align-items: center;
        min-height: 22px;
        padding: 0 8px;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.72);
        background: rgba(255, 255, 255, 0.09);
        font-size: 10px;
        line-height: 1;
        text-transform: capitalize;
      }

      .playground-mission-control-delivery-status.is-running,
      .playground-mission-control-delivery-status.is-queued {
        color: #8bc2ff;
        background: rgba(77, 163, 255, 0.14);
      }

      .playground-mission-control-delivery-status.is-passed {
        color: #9ce5a0;
        background: rgba(88, 194, 96, 0.14);
      }

      .playground-mission-control-delivery-status.is-blocked,
      .playground-mission-control-delivery-status.is-failed,
      .playground-mission-control-delivery-status.is-cancelled {
        color: #ff9b9b;
        background: rgba(255, 91, 91, 0.14);
      }

      .playground-mission-control-delivery-stages {
        display: flex;
        flex-direction: column;
      }

      .playground-mission-control-delivery-stage {
        min-width: 0;
        padding: 9px 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .playground-mission-control-delivery-stage-heading {
        min-width: 0;
        display: grid;
        grid-template-columns: 8px minmax(0, 1fr) auto auto;
        align-items: center;
        gap: 10px;
      }

      .playground-mission-control-delivery-stage:last-child {
        border-bottom: 0;
      }

      .playground-mission-control-delivery-stage-indicator {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
      }

      .playground-mission-control-delivery-stage-indicator.is-running {
        background: #4da3ff;
        box-shadow: 0 0 0 3px rgba(77, 163, 255, 0.12);
      }

      .playground-mission-control-delivery-stage-indicator.is-passed {
        background: #66cf70;
      }

      .playground-mission-control-delivery-stage-indicator.is-blocked,
      .playground-mission-control-delivery-stage-indicator.is-failed {
        background: #ff6868;
      }

      .playground-mission-control-delivery-stage-indicator.is-skipped {
        background: rgba(255, 255, 255, 0.3);
      }

      .playground-mission-control-delivery-stage-label,
      .playground-mission-control-delivery-budget,
      .playground-mission-control-delivery-empty,
      .playground-mission-control-delivery-error {
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-mission-control-delivery-stage-label {
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-mission-control-delivery-stage-attempt {
        color: rgba(255, 255, 255, 0.42);
        font-size: 10px;
        white-space: nowrap;
      }

      .playground-mission-control-delivery-evidence {
        min-width: 0;
        padding-left: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 10px;
        line-height: 1.35;
      }

      .playground-mission-control-delivery-evidence > span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-mission-control-delivery-evidence strong {
        color: rgba(255, 255, 255, 0.78);
        font-weight: 500;
      }

      .playground-mission-control-delivery-evidence code {
        margin-left: auto;
        color: rgba(255, 255, 255, 0.58);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 9px;
        white-space: nowrap;
      }

      .playground-mission-control-delivery-stage-error {
        padding-left: 18px;
        color: #ff8d8d;
        font-size: 10px;
        line-height: 1.4;
      }

      .playground-mission-control-delivery-budget {
        margin-top: 12px;
        padding-top: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-mission-control-delivery-budget span:last-child {
        color: rgba(255, 255, 255, 0.84);
      }

      .playground-mission-control-delivery-empty {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-mission-control-delivery-error {
        margin-top: 10px;
        color: #ff8d8d;
      }

      .playground-mission-control-delivery-approval {
        margin-top: 12px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        border: 1px solid rgba(255, 196, 0, 0.22);
        border-radius: 8px;
        background: rgba(255, 196, 0, 0.07);
        color: rgba(255, 255, 255, 0.62);
        font-size: 10px;
        line-height: 1.45;
      }

      .playground-mission-control-delivery-approval strong {
        color: rgba(255, 255, 255, 0.9);
        font-size: 11px;
        font-weight: 500;
      }

      .playground-mission-control-delivery-actions {
        margin-top: 12px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .playground-mission-control-delivery-actions .platform-button {
        flex: 1 1 auto;
        justify-content: center;
      }

      .playground-mission-control-delivery-events {
        margin-top: 12px;
        padding-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 7px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-mission-control-delivery-events-title {
        color: rgba(255, 255, 255, 0.72);
        font-size: 10px;
        font-weight: 500;
      }

      .playground-mission-control-delivery-event {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 10px;
        line-height: 1.35;
      }

      .playground-mission-control-delivery-event > span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-mission-control-delivery-event time {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.34);
      }

      .playground-mission-control-delivery-approval-copy {
        display: flex;
        flex-direction: column;
        gap: 14px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 13px;
        line-height: 1.55;
      }

      .playground-mission-control-delivery-approval-copy p {
        margin: 0;
      }

      .playground-mission-control-delivery-approval-copy code {
        display: block;
        padding: 10px 12px;
        overflow-wrap: anywhere;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.82);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
      }
`;
