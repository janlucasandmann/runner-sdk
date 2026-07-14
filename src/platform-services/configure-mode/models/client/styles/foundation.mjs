export const MODELS_STYLE_FOUNDATION = String.raw`
      .playground-models-page {
        overflow: auto;
        padding: 0 44px 56px;
        box-sizing: border-box;
      }

      .playground-models-page .playground-files-shell {
        width: min(100%, var(--playground-centered-page-max-width));
        height: auto;
        min-height: calc(100vh - 98px);
        margin: 0 auto;
        grid-template-columns: minmax(0, 1fr) 0 0;
      }

      .playground-models-page .playground-files-browser {
        margin: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-models-page .playground-files-browser-header,
      .playground-models-page .playground-files-browser-body {
        width: 100%;
        max-width: none;
        padding-left: 0;
        padding-right: 0;
      }

      .playground-models-page .playground-files-browser-header {
        position: sticky;
        top: 0;
        z-index: 180;
        padding-top: 42px;
        background: #000;
      }

      .playground-models-page .playground-files-browser-body {
        display: flex;
        flex-direction: column;
        flex: 0 0 auto;
        overflow: visible;
      }

      .playground-models-page .playground-files-library-title-row {
        align-items: center;
      }

      .playground-models-page .playground-files-library-actions {
        flex: 1 1 auto;
        justify-content: flex-end;
      }

      .playground-models-page .playground-files-library-search-anchor {
        flex: 1 1 min(360px, 100%);
        max-width: 360px;
      }

      .playground-models-page .playground-files-library-search {
        width: 100%;
      }

      .playground-models-page .playground-files-library-tabs {
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .playground-models-page .playground-files-library-tabs::-webkit-scrollbar {
        display: none;
      }

      .playground-models-page .playground-files-library-tab {
        min-width: max-content;
      }

      .playground-models-table-head,
      .playground-models-entry-row {
        display: grid;
        grid-template-columns:
          minmax(220px, 1.7fr)
          minmax(110px, 0.75fr)
          minmax(116px, 0.85fr)
          minmax(116px, 0.8fr)
          minmax(104px, 0.72fr)
          minmax(112px, 0.72fr);
        align-items: center;
        column-gap: 14px;
      }

      .playground-models-table-head.is-agent-pricing,
      .playground-models-entry-row.is-agent-pricing {
        grid-template-columns:
          minmax(220px, 1.5fr)
          minmax(102px, 0.62fr)
          minmax(104px, 0.64fr)
          minmax(88px, 0.52fr)
          minmax(88px, 0.52fr)
          minmax(92px, 0.54fr)
          minmax(92px, 0.54fr)
          minmax(92px, 0.54fr);
        column-gap: 12px;
      }

      .playground-models-table-head {
        position: relative;
        z-index: 1;
        margin-top: 14px;
        padding: 8px 0 8px;
        background: #000;
        color: rgba(255, 255, 255, 0.38);
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-models-table-head span {
        min-width: 0;
        white-space: nowrap;
      }

      .playground-models-table-head .is-right {
        text-align: right;
      }

      .playground-models-entry-list {
        margin-top: 0;
        padding-top: 0;
      }

      .playground-models-entry-row.playground-files-entry-row {
        width: 100%;
        min-height: 48px;
        margin-left: 0;
        margin-right: 0;
        padding: 7px 0;
        border-radius: 0;
        cursor: default;
      }

      .playground-models-entry-row.is-pricing-subrow {
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-models-entry-row.is-pricing-subrow .playground-models-entry-main {
        padding-left: 0;
      }

      .playground-models-entry-row.is-pricing-subrow .playground-files-entry-name {
        color: rgba(255, 255, 255, 0.78);
        font-weight: 400;
      }

      .playground-models-entry-main {
        min-width: 0;
      }

      .playground-models-entry-description {
        min-width: 0;
        max-width: 560px;
        color: rgba(255, 255, 255, 0.44);
        font-size: 12px;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-models-entry-value {
        min-width: 0;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-models-entry-value.is-strong {
        color: rgba(255, 255, 255, 0.84);
      }

      .playground-models-entry-value.is-right {
        text-align: right;
      }

      .playground-models-entry-value.is-price {
        font-variant-numeric: tabular-nums;
      }

      .playground-models-grid.playground-files-grid {
        grid-template-columns: repeat(auto-fill, minmax(218px, 1fr));
        align-items: stretch;
        margin-top: 14px;
      }

      .playground-models-grid-item.playground-files-grid-item {
        align-items: stretch;
        gap: 12px;
        min-height: 198px;
        padding: 14px;
        border-color: rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.05);
        cursor: default;
      }

      .playground-models-grid-item.is-agent-pricing {
        min-height: 238px;
      }

      .playground-models-grid-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-width: 0;
      }

      .playground-models-grid-provider {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        line-height: 1.2;
      }

      .playground-models-grid-provider span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-models-grid-price {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.82);
        font-size: 11px;
        line-height: 1.2;
        white-space: nowrap;
      }

      .playground-models-grid-item .playground-files-grid-item-name {
        text-align: left;
        font-size: 13px;
      }

      .playground-models-grid-item .playground-files-grid-item-meta {
        text-align: left;
        line-height: 1.4;
      }

      .playground-models-grid-facts {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 7px;
        margin-top: auto;
      }

      .playground-models-grid-fact {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-width: 0;
        color: rgba(255, 255, 255, 0.52);
        font-size: 11px;
        line-height: 1.3;
      }

      .playground-models-grid-fact span:first-child {
        flex: 0 0 auto;
      }

      .playground-models-grid-fact span:last-child {
        min-width: 0;
        color: rgba(255, 255, 255, 0.76);
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

`;
