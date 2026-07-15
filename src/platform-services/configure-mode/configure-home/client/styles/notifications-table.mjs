export const CONFIGURE_HOME_NOTIFICATIONS_TABLE_CSS = `	      .playground-configure-notifications-heading {
	        display: flex;
	        flex-direction: column;
	        gap: 4px;
	      }

	      .playground-configure-notifications-title {
	        margin: 0;
	        font-size: 14px;
	        font-weight: 400;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section.playground-agents-overview-table-section {
	        position: relative;
	        isolation: isolate;
	        gap: 0;
	        margin-top: 0 !important;
	        margin-bottom: 24px;
	        padding: 0 18px 6px;
	        border: 1px solid rgba(255, 255, 255, 0.075);
	        border-radius: 15px;
	        overflow: visible !important;
	        background: rgba(255, 255, 255, 0.075);
	        -webkit-backdrop-filter: none;
	        backdrop-filter: none;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section.playground-agents-overview-table-section::before {
	        content: none;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section > * {
	        position: relative;
	        z-index: 1;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-sticky-table-header {
	        position: sticky;
	        top: 0;
	        z-index: 240;
	        margin: 0 -18px;
	        padding: 12px 18px 0;
	        border-radius: 15px 15px 0 0;
	        background: #121212;
	        -webkit-backdrop-filter: none;
	        backdrop-filter: none;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-toolbar {
	        position: relative;
	        z-index: 1;
	        display: flex;
	        flex-direction: row;
	        align-items: center;
	        justify-content: flex-start;
	        flex-wrap: nowrap;
	        gap: 10px;
	        width: 100%;
	        margin: 0;
	        padding: 0 0 12px;
	        border-bottom: 0;
	        background: transparent;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-toolbar .playground-develop-server-kind-table-controls {
	        flex: 1 1 auto;
	        width: auto;
	        min-width: 0;
	        margin-left: 0;
	        display: flex;
	        justify-content: flex-start;
	        align-items: center;
	        flex-wrap: nowrap;
	        gap: 10px;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-toolbar .playground-develop-server-kind-search-shell {
	        flex: 0 1 340px;
	        width: min(340px, 100%);
	        min-width: min(280px, 100%);
	        max-width: 340px;
	        background: rgba(255, 255, 255, 0.025) !important;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-toolbar .playground-plugins-toolbar-controls {
	        display: inline-flex;
	        flex: 0 0 auto;
	        align-items: center;
	        flex-wrap: nowrap;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-toolbar .playground-notifications-mark-read-button {
	        flex: 0 0 auto;
	        margin-left: auto;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-tasks-toolbar-popup-shell {
	        z-index: 250;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-tasks-toolbar-popup-menu {
	        z-index: 251;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-list-table {
	        position: relative;
	        z-index: 0;
	        width: 100%;
	        margin: 0;
	        padding: 0;
	        border: 0;
	        border-radius: 0;
	        overflow: visible !important;
	        background: transparent;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-thread-list {
	        width: calc(100% + 24px);
	        margin-left: -12px;
	        padding: 0 12px;
	        border: 1px solid rgba(255, 255, 255, 0.1);
	        border-radius: 10px;
	        overflow: visible !important;
	        background: #000;
	        box-sizing: border-box;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-threads-table-header,
	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-threads-table-row {
	        grid-template-columns: minmax(260px, 1.45fr) minmax(120px, 0.52fr) minmax(90px, 0.38fr) minmax(110px, 0.48fr) minmax(32px, max-content) !important;
	        gap: 12px;
	        width: 100%;
	        max-width: 100%;
	        padding-right: 0;
	        box-sizing: border-box;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-column-header {
	        position: relative;
	        z-index: 1;
	        margin-top: 12px;
	        padding-top: 0;
	        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	        background: transparent;
	        -webkit-backdrop-filter: none;
	        backdrop-filter: none;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-row {
	        min-height: 58px;
	        padding-top: 12px;
	        padding-bottom: 12px;
	        overflow: visible !important;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-row.is-clickable {
	        cursor: pointer;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-overview-row.is-clickable:hover {
	        background: rgba(255, 255, 255, 0.025);
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-thread-list > .playground-notifications-overview-row:last-child {
	        border-bottom: 0;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-thread-cell,
	      .playground-configure-home .playground-configure-notifications-table-section .playground-agents-overview-table-value {
	        min-width: 0;
	        overflow: hidden;
	        text-overflow: ellipsis;
	        white-space: nowrap;
	        font-size: 12px;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-table-title,
	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-table-meta {
	        min-width: 0;
	        max-width: 100%;
	        overflow: hidden;
	        text-overflow: ellipsis;
	        white-space: nowrap;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-thread-cell.is-name {
	        color: rgba(255, 255, 255, 0.9);
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-thread-cell.is-actions,
	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-threads-table-header > div:last-child {
	        justify-self: end;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-project-overview-thread-cell.is-actions {
	        width: 100%;
	        display: flex;
	        align-items: center;
	        justify-content: flex-end;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-table-main {
	        gap: 8px;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-table-icon-shell {
	        width: 20px;
	        height: 20px;
	        flex: 0 0 20px;
	        border-radius: 50%;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-table-icon {
	        width: 12px;
	        height: 12px;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section .playground-notifications-table-copy {
	        gap: 0;
	      }

	      .playground-configure-home .playground-configure-notifications-table-section > .playground-notifications-empty {
	        min-height: 0;
	        margin: 0;
	        padding: 28px 24px;
	      }

`;
