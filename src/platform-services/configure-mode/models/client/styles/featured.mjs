export const MODELS_STYLE_FEATURED = String.raw`      .playground-models-featured-section {
        width: 100%;
        margin: 0 0 24px;
      }

      .playground-models-featured-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-models-featured-card {
        --playground-model-featured-accent: 126, 200, 255;
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 184px;
        padding: 15px;
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        overflow: hidden;
        box-sizing: border-box;
      }

      .playground-models-featured-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 14px;
        right: 14px;
        height: 1px;
        background: rgba(var(--playground-model-featured-accent), 0.82);
      }

      .playground-models-featured-card.is-speed {
        --playground-model-featured-accent: 126, 200, 255;
      }

      .playground-models-featured-card.is-code {
        --playground-model-featured-accent: 204, 174, 255;
      }

      .playground-models-featured-card.is-agent {
        --playground-model-featured-accent: 133, 223, 123;
      }

      .playground-models-featured-card.is-frontier {
        --playground-model-featured-accent: 245, 184, 108;
      }

      .playground-models-featured-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-width: 0;
      }

      .playground-models-featured-provider {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
        color: rgba(255, 255, 255, 0.58);
        font-size: 11px;
        line-height: 1.2;
      }

      .playground-models-featured-provider-icon {
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border: 1px solid rgba(var(--playground-model-featured-accent), 0.18);
        border-radius: 6px;
        background: rgba(var(--playground-model-featured-accent), 0.08);
      }

      .playground-models-featured-provider-icon .playground-agents-model-provider-icon-shell {
        width: 15px;
        height: 15px;
      }

      .playground-models-featured-provider-icon .playground-agents-model-provider-icon,
      .playground-models-featured-provider-icon svg {
        width: 15px;
        height: 15px;
        object-fit: contain;
      }

      .playground-models-featured-provider-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-models-featured-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex: 0 0 auto;
        padding: 4px 7px;
        border-radius: 999px;
        background: rgba(var(--playground-model-featured-accent), 0.1);
        color: rgba(var(--playground-model-featured-accent), 0.94);
        font-size: 10px;
        font-weight: 500;
        line-height: 1;
        white-space: nowrap;
      }

      .playground-models-featured-name {
        margin: 16px 0 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.3;
      }

      .playground-models-featured-description {
        margin: 6px 0 14px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 11px;
        line-height: 1.45;
      }

      .playground-models-featured-metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: auto;
        padding-top: 11px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-models-featured-metric {
        min-width: 0;
      }

      .playground-models-featured-metric-label,
      .playground-models-featured-metric-value {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-models-featured-metric-label {
        color: rgba(255, 255, 255, 0.36);
        font-size: 9px;
        line-height: 1.2;
      }

      .playground-models-featured-metric-value {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.82);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.2;
      }

      @media (max-width: 980px) {
        .playground-models-page .playground-files-library-title-row,
        .playground-models-page .playground-files-library-nav-row {
          align-items: stretch;
          flex-direction: column;
          gap: 12px;
        }

        .playground-models-page .playground-files-library-actions,
        .playground-models-page .playground-files-library-controls {
          width: 100%;
          justify-content: flex-start;
        }

        .playground-models-page .playground-files-library-search-anchor {
          max-width: none;
        }

        .playground-models-table-head {
          display: none;
        }

        .playground-models-overview-toolbar-row {
          align-items: stretch;
          flex-wrap: wrap !important;
        }

        .playground-models-overview-search-shell {
          flex-basis: 100% !important;
          width: 100% !important;
          max-width: none !important;
        }

        .playground-models-overview-category-row {
          width: 100%;
          margin-left: 0;
        }

        .playground-models-overview-category-switch {
          flex: 1 1 auto;
        }

        .playground-models-overview-table-section .playground-models-overview-column-header {
          display: none;
        }

        .playground-models-overview-table-section .playground-models-overview-table-row,
        .playground-models-overview-table-section .playground-models-overview-table-row.is-agent-pricing {
          grid-template-columns: minmax(0, 1fr);
          row-gap: 7px;
        }

        .playground-models-overview-table-section .playground-models-overview-table-row .playground-models-overview-cell:not(.is-name) {
          grid-column: 1;
        }

        .playground-models-featured-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-models-entry-row.playground-files-entry-row {
          grid-template-columns: minmax(0, 1fr);
          row-gap: 6px;
          align-items: stretch;
        }

        .playground-models-entry-row.is-pricing-subrow .playground-models-entry-main {
          padding-left: 0;
        }

        .playground-models-entry-value,
        .playground-models-entry-value.is-right {
          text-align: left;
        }
      }

      @media (max-width: 720px) {
        .playground-models-page {
          padding: 0 18px 42px;
        }

        .playground-models-featured-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
`;
