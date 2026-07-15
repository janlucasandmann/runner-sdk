export const API_KEYS_PAGE_CSS_FRAGMENT = `		      .playground-develop-api-keys-page .playground-develop-api-keys-page-header {
		        margin-bottom: 24px;
		      }

		      .playground-resources-page.is-develop-server-kind-page.playground-develop-api-keys-page .playground-develop-api-keys-column-header {
		        margin-top: 0;
		      }

		      .playground-develop-api-keys-page .playground-develop-api-keys-created-notice,
		      .playground-develop-api-keys-page .playground-settings-inline-status {
		        margin-bottom: 16px;
		      }

		      .playground-resources-page.is-develop-server-kind-page.playground-develop-api-keys-page .playground-develop-resource-overview-table-section.playground-develop-api-keys-table-section .playground-project-overview-threads-table-header,
		      .playground-resources-page.is-develop-server-kind-page.playground-develop-api-keys-page .playground-develop-resource-overview-table-section.playground-develop-api-keys-table-section .playground-project-overview-threads-table-row {
		        grid-template-columns: 28px minmax(180px, 1.45fr) minmax(112px, 0.72fr) minmax(88px, 0.52fr) minmax(88px, 0.52fr) minmax(140px, 0.8fr) minmax(96px, 0.56fr) 32px !important;
		        gap: 12px;
		      }

		      .playground-develop-api-keys-page .playground-develop-api-keys-column-header > div:nth-child(2) {
		        justify-content: flex-start !important;
		      }

		      .playground-develop-api-keys-page .playground-develop-api-keys-column-header > div:first-child,
		      .playground-develop-api-keys-page .playground-develop-api-keys-table-row .is-select {
		        display: flex;
		        align-items: center;
		        justify-content: center;
		      }

		      .playground-develop-api-keys-page .playground-develop-api-keys-table-row {
		        cursor: default;
		      }

		      .playground-develop-api-keys-page .playground-develop-api-keys-secret {
		        font-family: "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace;
		      }

		      .playground-develop-api-keys-page .playground-settings-api-keys-name-row {
		        max-width: 100%;
		      }

		      .playground-develop-api-keys-page .playground-develop-api-keys-empty {
		        min-height: 96px;
		        margin: 0;
		        padding: 28px 20px;
		      }

		      @media (max-width: 1180px) {
		        .playground-develop-api-keys-page .playground-develop-api-keys-column-header > div:nth-child(6),
		        .playground-develop-api-keys-page .playground-develop-api-keys-table-row .is-created-by {
		          display: none;
		        }

		        .playground-resources-page.is-develop-server-kind-page.playground-develop-api-keys-page .playground-develop-resource-overview-table-section.playground-develop-api-keys-table-section .playground-project-overview-threads-table-header,
		        .playground-resources-page.is-develop-server-kind-page.playground-develop-api-keys-page .playground-develop-resource-overview-table-section.playground-develop-api-keys-table-section .playground-project-overview-threads-table-row {
		          grid-template-columns: 28px minmax(170px, 1fr) minmax(110px, 0.64fr) minmax(92px, 0.46fr) minmax(92px, 0.46fr) minmax(100px, 0.5fr) 32px !important;
		        }
		      }

		      @media (max-width: 860px) {
		        .playground-develop-api-keys-page .playground-develop-api-keys-column-header > div:nth-child(3),
		        .playground-develop-api-keys-page .playground-develop-api-keys-column-header > div:nth-child(5),
		        .playground-develop-api-keys-page .playground-develop-api-keys-table-row .is-secret,
		        .playground-develop-api-keys-page .playground-develop-api-keys-table-row > .is-date:nth-child(5) {
		          display: none;
		        }

		        .playground-resources-page.is-develop-server-kind-page.playground-develop-api-keys-page .playground-develop-resource-overview-table-section.playground-develop-api-keys-table-section .playground-project-overview-threads-table-header,
		        .playground-resources-page.is-develop-server-kind-page.playground-develop-api-keys-page .playground-develop-resource-overview-table-section.playground-develop-api-keys-table-section .playground-project-overview-threads-table-row {
		          grid-template-columns: 28px minmax(160px, 1fr) minmax(92px, 0.48fr) minmax(100px, 0.52fr) 32px !important;
		        }
		      }

		      .playground-api-key-reveal-modal .playground-settings-code-row {
		        margin-top: 4px;
		      }

		      .playground-api-key-reveal-modal .playground-settings-code {
		        min-width: 0;
		        overflow-wrap: anywhere;
		        white-space: normal;
		        user-select: all;
		      }

		      .playground-api-key-reveal-error {
		        color: rgba(255, 255, 255, 0.6);
		        font-size: 12px;
		        line-height: 1.5;
		      }
`;
