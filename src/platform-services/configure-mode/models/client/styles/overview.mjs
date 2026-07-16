export const MODELS_STYLE_OVERVIEW = String.raw`      .resource-overview-page.is-models-overview {
        overflow: hidden;
      }

      .resource-overview-page.is-models-overview .resource-overview-page__table-section {
        min-height: 240px;
      }

      .resource-overview-table.is-models-overview .platform-data-table__toolbar-leading {
        overflow: hidden;
      }

      .resource-overview-table.is-models-overview .models-overview-tab-bar {
        width: auto;
        max-width: 100%;
      }

      .resource-overview-table.is-models-overview .platform-data-table__footer {
        padding: 16px 0 0;
        border-top: 0;
      }

      .resource-overview-table.is-models-overview .platform-data-table__footer .playground-models-skill-settings-section {
        margin-top: 0;
      }

      .playground-models-skill-settings-section {
        margin-top: 16px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-models-skill-settings-copy {
        min-width: 0;
      }

      .playground-models-skill-settings-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.35;
      }

      .playground-models-skill-settings-description {
        margin: 6px 0 0;
        max-width: 720px;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-models-skill-settings-button {
        flex: 0 0 auto;
        white-space: nowrap;
      }

      .playground-models-page.playground-agents-overview-page {
        padding-top: 0;
      }

      .playground-models-page .playground-models-browser-header {
        position: relative;
        top: auto;
        z-index: 1;
        margin-top: 42px;
        padding: 0 0 12px;
        background: transparent;
      }

      .playground-models-page .playground-models-library-header {
        display: block;
      }

      .playground-models-page .playground-models-library-header .playground-files-library-title-row {
        min-height: 24px;
        margin: 0;
      }

      .playground-models-page .playground-files-library-title {
        font-size: 16px;
        font-weight: 400;
      }

      .playground-models-overview-table-section.playground-agents-overview-table-section {
        margin-top: 0 !important;
        margin-bottom: 24px;
      }

      .playground-models-overview-table-section .playground-models-overview-sticky-table-header {
        position: sticky;
        top: 0;
      }

      .playground-models-overview-toolbar-row {
        display: flex !important;
        align-items: center;
        justify-content: flex-start !important;
        flex-flow: row nowrap !important;
        gap: 10px;
        width: 100%;
        padding: 0 0 12px !important;
        margin: 0 !important;
        pointer-events: auto;
      }

      .playground-models-overview-toolbar-row > *,
      .playground-models-overview-toolbar-row button,
      .playground-models-overview-toolbar-row input {
        position: relative;
        z-index: 2;
        pointer-events: auto;
      }

      .playground-models-overview-search-shell {
        flex: 0 1 340px !important;
        width: min(340px, 100%) !important;
        min-width: 220px !important;
        max-width: 340px !important;
        background: rgba(255, 255, 255, 0.025) !important;
      }

      .playground-models-overview-controls {
        flex: 0 0 auto;
        flex-wrap: nowrap !important;
      }

      .playground-models-overview-table-section .playground-models-overview-table,
      .playground-models-overview-table-section .playground-models-entry-list {
        overflow: visible !important;
      }

      .playground-models-overview-table-section .playground-models-entry-list {
        box-sizing: border-box;
      }

      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-column-header,
      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-table-row {
        display: grid;
        grid-template-columns:
          minmax(170px, 1.3fr)
          minmax(90px, 0.66fr)
          minmax(108px, 0.72fr)
          minmax(108px, 0.78fr)
          minmax(104px, 0.68fr)
          minmax(118px, 0.76fr) !important;
        align-items: center;
        gap: 12px !important;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-column-header.is-agent-pricing,
      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-table-row.is-agent-pricing {
        grid-template-columns:
          minmax(170px, 1.32fr)
          minmax(86px, 0.56fr)
          minmax(108px, 0.68fr)
          minmax(94px, 0.62fr)
          minmax(92px, 0.58fr)
          minmax(88px, 0.56fr)
          minmax(88px, 0.56fr)
          minmax(88px, 0.56fr) !important;
        gap: 10px !important;
      }

      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-column-header.is-image-models,
      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-table-row.is-image-models {
        grid-template-columns:
          minmax(210px, 1.35fr)
          minmax(100px, 0.62fr)
          minmax(170px, 1.05fr)
          minmax(118px, 0.72fr)
          minmax(100px, 0.62fr)
          minmax(220px, 1.35fr) !important;
      }

      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-column-header.is-video-models,
      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-table-row.is-video-models {
        grid-template-columns:
          minmax(220px, 1.38fr)
          minmax(100px, 0.62fr)
          minmax(96px, 0.56fr)
          minmax(150px, 0.88fr)
          minmax(180px, 1.04fr)
          minmax(140px, 0.82fr) !important;
      }

      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-column-header.is-deep-research-models,
      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-table-row.is-deep-research-models {
        grid-template-columns:
          minmax(210px, 1.28fr)
          minmax(100px, 0.6fr)
          minmax(180px, 1.02fr)
          minmax(180px, 1.02fr)
          minmax(100px, 0.58fr)
          minmax(190px, 1.12fr) !important;
      }

      .playground-models-overview-table-section .playground-models-overview-column-header,
      .playground-models-overview-table-section .playground-models-overview-column-header *,
      .playground-models-overview-table-section .playground-models-overview-table-row,
      .playground-models-overview-table-section .playground-models-overview-table-row * {
        font-size: 12px;
      }

      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-column-header > div:first-child {
        display: flex;
        align-items: center;
        justify-content: flex-start !important;
        justify-self: stretch;
        min-width: 0;
      }

      .playground-models-overview-table-section .playground-models-overview-column-header .is-right,
      .playground-models-overview-cell.is-right {
        justify-content: flex-end;
        text-align: right;
      }

      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-column-header.is-agent-pricing > .is-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-width: 0;
      }

      .playground-models-page.playground-agents-overview-page .playground-models-overview-table-section .playground-models-overview-column-header.is-agent-pricing > .is-right .playground-agents-overview-sortable-header {
        width: 100%;
        justify-content: flex-end;
      }

      .playground-models-overview-table-section .playground-models-overview-table-row {
        min-height: 58px;
        padding-top: 12px;
        padding-bottom: 12px;
        cursor: default;
        overflow: visible !important;
      }

      .playground-models-overview-table-section .playground-models-overview-table-row.is-pricing-subrow .playground-models-entry-main {
        padding-left: 0;
      }

      .playground-models-overview-cell,
      .playground-models-overview-cell .playground-models-entry-value {
        min-width: 0;
      }

      .playground-models-entry-main {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-models-overview-cell .playground-files-entry-copy {
        min-width: 0;
      }

      .playground-models-overview-cell .playground-files-entry-name,
      .playground-models-overview-cell .playground-models-entry-value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-models-overview-menu {
        min-width: 220px;
      }

      .playground-models-overview-menu.is-closing {
        pointer-events: none;
      }

      .playground-models-overview-table-section .playground-plugins-empty {
        min-height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

`;
