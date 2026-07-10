export const MODELS_PAGE_CSS = String.raw`
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

      .playground-models-overview-category-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        margin-left: auto;
      }

      .playground-models-overview-category-switch {
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .playground-models-overview-category-switch::-webkit-scrollbar {
        display: none;
      }

      .playground-models-overview-category-switch .content-mode-button {
        min-width: max-content;
        padding-left: 14px;
        padding-right: 14px;
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

      .playground-models-featured-section {
        width: 100%;
        margin: 0 0 24px;
      }

      .playground-models-featured-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 12px;
      }

      .playground-models-featured-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.35;
      }

      .playground-models-featured-caption {
        margin: 0;
        color: rgba(255, 255, 255, 0.42);
        font-size: 11px;
        line-height: 1.35;
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

        .playground-models-featured-header {
          align-items: flex-start;
          flex-direction: column;
          gap: 4px;
        }

        .playground-models-featured-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
`;

export const MODELS_PAGE_SCRIPT = String.raw`
      const PLAYGROUND_MANAGED_MODELS_CT_PER_DOLLAR = 100;
      const PLAYGROUND_MANAGED_AGENT_MODEL_TPS_BY_ID = {
        "claude-haiku-4-5": 97.7,
        "claude-sonnet-4-5": 41.9,
        "claude-opus-4-6": 39.4,
        "claude-opus-4-7": 56.4,
        "claude-opus-4-8": 58.3,
        "gpt-5.5-pro": null,
        "gpt-5.5": 95.6,
        "gpt-5.4": 174.5,
        "gpt-5.4-mini": 180.6,
        "gpt-5.4-nano": 147.0,
        "grok-4.5": 85,
        "gemini-3-flash": 176.9,
        "gemini-3-1-flash": 176.9,
        "gemini-3-1-pro": 132.2,
        "deepseek-v4-pro": 46.0,
        "deepseek-v4-flash": 116.4,
        "minimax-m3": 41.1,
        "kimi-k2.6": 60.1,
        "kimi-k2.7-code": null,
        "glm-5.2": 206.8,
        "qwen3.5-397b-a17b": 137.9,
      };
      const PLAYGROUND_MANAGED_AGENT_MODEL_INTELLIGENCE_BY_ID = {
        "gemini-3-flash": "Good",
        "gemini-3-1-flash": "Good",
        "gemini-3-1-pro": "High",
        "deepseek-v4-pro": "High",
        "minimax-m3": "High",
        "kimi-k2.6": "High",
        "kimi-k2.7-code": "High",
        "glm-5.2": "Highest",
        "qwen3.5-397b-a17b": "High",
        "grok-4.5": "Highest",
      };

      function formatPlaygroundManagedLegacyCtPrice(value, unitLabel) {
        const numericValue = Math.max(0, Number(value || 0));
        const dollars = Number.isFinite(numericValue) ? numericValue / PLAYGROUND_MANAGED_MODELS_CT_PER_DOLLAR : 0;
        const smallValue = dollars > 0 && dollars < 1;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: smallValue ? 4 : 2,
          maximumFractionDigits: smallValue ? 4 : 2,
        }).format(dollars);
        return formatted + (unitLabel ? " / " + unitLabel : "");
      }

      function normalizePlaygroundManagedModelsTab(tabId) {
        const normalizedTabId = String(tabId || "").trim();
        return normalizedTabId === "image" || normalizedTabId === "video" || normalizedTabId === "deep_research"
          ? normalizedTabId
          : "agent";
      }

      function getPlaygroundManagedModelsTabs() {
        return [
          { id: "agent", label: "Agent Models" },
          { id: "image", label: "Image" },
          { id: "video", label: "Video" },
          { id: "deep_research", label: "Deep Research" },
        ];
      }

      function getPlaygroundManagedVideoModelOptions() {
        return [
          {
            id: "grok-imagine-video",
            label: "Grok Imagine Video",
            provider: "xAI",
            description: "Imaginative video generation and stylized motion clips.",
            maxDuration: "15s",
            resolutions: "480p, 720p",
            inputModalities: "Text, Image, Video",
            pricingLabel: formatPlaygroundManagedLegacyCtPrice(5.5, "sec"),
            pricingRank: 5.5,
          },
          {
            id: "seedance-2.0-fast",
            baseModelId: "seedance-2.0-fast",
            label: "Seedance 2.0 Fast",
            provider: "ByteDance",
            description: "Fast video generation with reference media support.",
            maxDuration: "12s",
            resolutions: "480p, 720p",
            inputModalities: "Text, Image, Video",
            pricingLabel: formatPlaygroundManagedLegacyCtPrice(8.8, "sec"),
            pricingRank: 8.8,
          },
          {
            id: "seedance-2.0",
            baseModelId: "seedance-2.0",
            label: "Seedance 2.0",
            provider: "ByteDance",
            description: "Higher-quality video generation with 1080p output support.",
            maxDuration: "12s",
            resolutions: "480p, 720p, 1080p",
            inputModalities: "Text, Image, Video",
            pricingLabel: "",
            hidePricingLabel: true,
            pricingRank: 24.2,
          },
          {
            id: "seedance-2.0:standard",
            baseModelId: "seedance-2.0",
            label: "Default / 720p",
            provider: "ByteDance",
            description: "Pricing tier for Seedance 2.0",
            maxDuration: "12s",
            resolutions: "480p, 720p",
            inputModalities: "Text, Image, Video",
            pricingLabel: formatPlaygroundManagedLegacyCtPrice(24.2, "sec"),
            pricingRank: 24.2,
            subrowRank: 0,
            isPricingSubrow: true,
          },
          {
            id: "seedance-2.0:1080p",
            baseModelId: "seedance-2.0",
            label: "1080p",
            provider: "ByteDance",
            description: "Pricing tier for Seedance 2.0",
            maxDuration: "12s",
            resolutions: "1080p",
            inputModalities: "Text, Image, Video",
            pricingLabel: formatPlaygroundManagedLegacyCtPrice(60.5, "sec"),
            pricingRank: 60.5,
            subrowRank: 1,
            isPricingSubrow: true,
          },
        ];
      }

      function getPlaygroundManagedDeepResearchModelOptions() {
        return PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.map((model) => {
          const normalizedId = String(model?.id || "").trim();
          const isPro = normalizedId.includes("pro");
          return {
            id: normalizedId,
            label: model?.label || normalizedId,
            provider: "Google",
            description: model?.description || "",
            mode: isPro ? "Higher-depth research" : "Fast research",
            contextWindow: "Web, files, sources",
            speed: isPro ? "Fast" : "Very Fast",
            pricingLabel: isPro ? "Higher cost / research run" : "Lower cost / research run",
            pricingRank: isPro ? 2 : 1,
          };
        });
      }

      function formatPlaygroundManagedImagePricing(modelId) {
        const low = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "low");
        const medium = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "medium");
        const high = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "high");
        if (low === medium && medium === high) {
          return formatPlaygroundManagedLegacyCtPrice(medium, "image");
        }
        return "Low " + formatPlaygroundManagedLegacyCtPrice(low, "image")
          + " · Medium " + formatPlaygroundManagedLegacyCtPrice(medium, "image")
          + " · High " + formatPlaygroundManagedLegacyCtPrice(high, "image");
      }

      function getPlaygroundManagedImageModelOptions() {
        return PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS.flatMap((model) => {
          const modelId = String(model?.id || "").trim();
          const baseRow = {
            id: modelId,
            baseModelId: modelId,
            label: model?.label || modelId || "",
            provider: model?.provider || "Managed",
            description: model?.description || "",
            mode: String(modelId || "").includes("image-preview") ? "Image generation and editing" : "Image generation and inpainting",
            contextWindow: "Auto",
            speed: String(modelId || "").includes("gemini") ? "Very Fast" : "Fast",
            pricingLabel: formatPlaygroundManagedImagePricing(modelId),
            pricingRank: getPlaygroundImageGenerationComputeTokensPerImage(modelId, "medium"),
          };
          if (modelId !== "gpt-image-2") {
            return [baseRow];
          }
          baseRow.pricingLabel = "";
          baseRow.hidePricingLabel = true;
          const qualityRows = PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS.map((quality) => {
            const qualityId = String(quality?.id || "medium").trim() || "medium";
            const qualityLabel = quality?.label || qualityId;
            const computeTokens = getPlaygroundImageGenerationComputeTokensPerImage(modelId, qualityId);
            return {
              ...baseRow,
              id: modelId + ":" + qualityId,
              label: String(qualityLabel || qualityId).trim() || qualityId,
              description: "Quality tier for GPT Image 2",
              contextWindow: String(qualityLabel || "").trim() + " quality",
              pricingLabel: formatPlaygroundManagedLegacyCtPrice(computeTokens, "image"),
              hidePricingLabel: false,
              pricingRank: computeTokens,
              subrowRank: qualityId === "low" ? 0 : qualityId === "medium" ? 1 : qualityId === "high" ? 2 : 99,
              qualityId,
              qualityLabel,
              isPricingSubrow: true,
            };
          });
          return [baseRow, ...qualityRows];
        });
      }

      function getPlaygroundManagedModelsForTab(tabId, agentModelOptions) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "image") {
          return getPlaygroundManagedImageModelOptions();
        }
        if (normalizedTabId === "video") {
          return getPlaygroundManagedVideoModelOptions();
        }
        if (normalizedTabId === "deep_research") {
          return getPlaygroundManagedDeepResearchModelOptions();
        }
        return (Array.isArray(agentModelOptions) && agentModelOptions.length > 0 ? agentModelOptions : PLAYGROUND_AGENT_MODEL_OPTIONS)
          .filter((model) => model?.id && model?.label)
          .map((model) => {
            const modelId = String(model?.id || "").trim();
            const intelligence = PLAYGROUND_MANAGED_AGENT_MODEL_INTELLIGENCE_BY_ID[modelId];
            return intelligence ? { ...model, intelligence, intelligenceLabel: intelligence } : model;
          });
      }

      function getPlaygroundManagedModelProviderLabel(tabId, model) {
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          const providerKey = getPlaygroundAgentModelProviderFilterKey(model);
          return providerKey === "custom" ? "Custom" : getPlaygroundAgentModelProviderLabel(model);
        }
        return String(model?.provider || "Managed").trim() || "Managed";
      }

      function getPlaygroundManagedModelProviderFilterKey(tabId, model) {
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          return getPlaygroundAgentModelProviderFilterKey(model);
        }
        const normalized = getPlaygroundManagedModelProviderLabel(tabId, model)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return normalized || "managed";
      }

      function getPlaygroundManagedModelsProviderFilterOptions(tabId, rows) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        const options = [{ id: "all", label: "All models" }];
        const seen = new Set();
        rows.forEach((model) => {
          const id = getPlaygroundManagedModelProviderFilterKey(normalizedTabId, model);
          if (!id || seen.has(id)) return;
          seen.add(id);
          options.push({ id, label: getPlaygroundManagedModelProviderLabel(normalizedTabId, model) });
        });
        options.sort((left, right) => {
          if (left.id === "all") return -1;
          if (right.id === "all") return 1;
          return left.label.localeCompare(right.label);
        });
        if (normalizedTabId === "agent") {
          options.push({ id: "available", label: "Available" });
          options.push({ id: "locked", label: "Plan required" });
        }
        return options;
      }

      function getPlaygroundManagedModelsSortOptions(tabId) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "agent") {
          return [
            { id: "provider", label: "Provider", direction: "asc" },
            { id: "name", label: "Name (A-Z)", direction: "asc" },
            { id: "intelligence", label: "Highest intelligence", direction: "desc" },
            { id: "cost-input", label: "Lowest input cost", direction: "asc" },
            { id: "context", label: "Largest context", direction: "desc" },
            { id: "speed", label: "Highest TPS", direction: "desc" },
          ];
        }
        return [
          { id: "provider", label: "Provider", direction: "asc" },
          { id: "name", label: "Name (A-Z)", direction: "asc" },
          { id: "cost", label: "Lowest cost", direction: "asc" },
          { id: "speed", label: "Fastest", direction: "desc" },
        ];
      }

      function readPlaygroundManagedModelContextValue(model) {
        const raw = String(model?.contextWindow || "").trim().toLowerCase();
        const match = raw.match(/([0-9]+(?:\.[0-9]+)?)/);
        if (!match) return 0;
        const value = Number(match[1]);
        if (!Number.isFinite(value)) return 0;
        if (raw.includes("m")) return value * 1000000;
        if (raw.includes("k")) return value * 1000;
        return value;
      }

      function hasPlaygroundManagedAgentModelTps(model) {
        return Object.prototype.hasOwnProperty.call(PLAYGROUND_MANAGED_AGENT_MODEL_TPS_BY_ID, String(model?.id || "").trim());
      }

      function readPlaygroundManagedAgentModelTps(model) {
        const modelId = String(model?.id || "").trim();
        const value = PLAYGROUND_MANAGED_AGENT_MODEL_TPS_BY_ID[modelId];
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
      }

      function formatPlaygroundManagedAgentModelTps(model) {
        const value = readPlaygroundManagedAgentModelTps(model);
        return value === null ? "—" : value.toFixed(1) + " t/s";
      }

      function readPlaygroundManagedModelSpeedRank(model) {
        if (hasPlaygroundManagedAgentModelTps(model)) {
          const tpsValue = readPlaygroundManagedAgentModelTps(model);
          return tpsValue === null ? -1 : tpsValue;
        }
        const normalized = String(model?.speed || "").trim().toLowerCase();
        if (normalized.includes("very")) return 4;
        if (normalized.includes("fast")) return 3;
        if (normalized.includes("medium")) return 2;
        if (normalized.includes("slow")) return 1;
        return 0;
      }

      function getPlaygroundManagedModelPricingRank(tabId, model) {
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          return getPlaygroundAgentModelWeightedCost(model?.id) || Number.POSITIVE_INFINITY;
        }
        const rank = Number(model?.pricingRank);
        return Number.isFinite(rank) ? rank : Number.POSITIVE_INFINITY;
      }

      function getPlaygroundManagedModelPricingLabel(tabId, model) {
        if (model?.hidePricingLabel) {
          return "";
        }
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          return formatPlaygroundAgentModelComputeTokenCost(model?.id);
        }
        return String(model?.pricingLabel || "Usage-based pricing").trim() || "Usage-based pricing";
      }

      function readPlaygroundManagedAgentPricingNumber(value) {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
      }

      function getPlaygroundManagedAgentModelPricing(model) {
        const modelId = String(model?.id || "").trim();
        if (!modelId || typeof PLAYGROUND_AGENT_MODEL_PRICING_BY_ID === "undefined") {
          return null;
        }
        return PLAYGROUND_AGENT_MODEL_PRICING_BY_ID[modelId] || null;
      }

      function formatPlaygroundManagedAgentUsdPerMTok(value) {
        const numericValue = readPlaygroundManagedAgentPricingNumber(value);
        if (numericValue === null) {
          return "—";
        }
        const retailValue = numericValue * 1.1;
        const fractionDigits = retailValue > 0 && retailValue < 0.01
          ? 4
          : retailValue > 0 && retailValue < 1
            ? 3
            : 2;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(retailValue);
      }

      function getPlaygroundManagedAgentPricingCells(model) {
        const pricing = getPlaygroundManagedAgentModelPricing(model);
        return {
          input: formatPlaygroundManagedAgentUsdPerMTok(pricing?.input),
          output: formatPlaygroundManagedAgentUsdPerMTok(pricing?.output),
          cached: formatPlaygroundManagedAgentUsdPerMTok(pricing?.cached),
        };
      }

      function getPlaygroundManagedModelsSkillSettingsMeta(tabId) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "image") {
          return {
            skillId: "image_generation",
            title: "Choose default image models in skill settings",
            description: "Agents use the selected Image Generation defaults unless the thread prompt asks for another image model or quality.",
            buttonLabel: "Image Settings",
          };
        }
        if (normalizedTabId === "video") {
          return {
            skillId: "video_generation",
            title: "Choose default video models in skill settings",
            description: "Agents use the selected Video Generation model by default while still honoring explicit model requests in prompts.",
            buttonLabel: "Video Settings",
          };
        }
        if (normalizedTabId === "deep_research") {
          return {
            skillId: "deep_research",
            title: "Choose default research models in skill settings",
            description: "Agents use the selected Deep Research model by default unless the user asks for a different research model.",
            buttonLabel: "Research Settings",
          };
        }
        return null;
      }

      function renderPlaygroundManagedModelProviderIcon(tabId, model) {
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          const providerIcon = getPlaygroundAgentModelProviderIcon(model);
          return providerIcon
            ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                React.createElement("img", {
                  src: providerIcon.src,
                  alt: "",
                  draggable: "false",
                  className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                })
              )
            : React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                React.createElement(Bot, { width: 16, height: 16, strokeWidth: 1.8 })
              );
        }
        if (normalizePlaygroundManagedModelsTab(tabId) === "image") {
          const normalizedProvider = String(model?.provider || "").trim().toLowerCase();
          const providerIcon = normalizedProvider.includes("google")
            ? { src: "/img/05-model-provider-icons/gemini.png", alt: "Google", className: "" }
            : normalizedProvider.includes("openai")
              ? { src: "/img/05-model-provider-icons/openai.svg", alt: "OpenAI", className: "is-openai" }
              : getPlaygroundAgentModelProviderIcon({
                  id: model?.baseModelId || model?.id,
                  providerType: model?.provider || "",
                  source: "managed",
                  contextWindow: "Images",
                });
          return providerIcon
            ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                React.createElement("img", {
                  src: providerIcon.src,
                  alt: "",
                  draggable: "false",
                  className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                })
              )
            : React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                React.createElement(ImageIcon, { width: 16, height: 16, strokeWidth: 1.8 })
              );
        }
        const Icon = tabId === "image" ? ImageIcon : tabId === "video" ? Film : Telescope;
        if (normalizePlaygroundManagedModelsTab(tabId) === "video") {
          const normalizedProvider = String(model?.provider || "").trim().toLowerCase();
          const providerIcon = normalizedProvider.includes("bytedance")
            ? { src: "/img/05-model-provider-icons/bytedance.svg", alt: "ByteDance", className: "" }
            : normalizedProvider.includes("xai") || normalizedProvider.includes("x.ai")
              ? { src: "/img/05-model-provider-icons/xai.svg", alt: "xAI", className: "" }
              : null;
          if (providerIcon) {
            return React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
              React.createElement("img", {
                src: providerIcon.src,
                alt: "",
                draggable: "false",
                className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
              })
            );
          }
        }
        if (normalizePlaygroundManagedModelsTab(tabId) === "deep_research") {
          return React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
            React.createElement("img", {
              src: "/img/05-model-provider-icons/gemini.png",
              alt: "",
              draggable: "false",
              className: "playground-agents-model-provider-icon",
            })
          );
        }
        return React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
          React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.8 })
        );
      }

      function renderPlaygroundManagedModelIntelligence(model) {
        const intelligenceLabel = String(model?.intelligence || model?.intelligenceLabel || "Custom").trim() || "Custom";
        const intelligenceLevel = Math.max(1, Math.min(4, getPlaygroundAgentIntelligenceLevel(intelligenceLabel)));
        return React.createElement("span", {
            className: "playground-agents-model-brains",
            title: intelligenceLabel,
            "aria-label": intelligenceLabel + " intelligence, level " + intelligenceLevel + " of 4",
          },
          Array.from({ length: 4 }).map((_, index) =>
            React.createElement(Brain, {
              key: String(model?.id || "model") + "-brain-" + index,
              className: "playground-agents-model-brain" + (index < intelligenceLevel ? " is-active" : ""),
              width: 12,
              height: 12,
              strokeWidth: 1.9,
            })
          )
        );
      }

      function sortPlaygroundManagedModels(tabId, rows, sortId, sortDirection = "asc") {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        const normalizedSortId = String(sortId || "provider").trim() || "provider";
        const directionMultiplier = String(sortDirection || "asc").trim().toLowerCase() === "desc" ? -1 : 1;
        const compareRows = (left, right) => {
          let comparison = 0;
          if (normalizedSortId === "name") {
            comparison = String(left?.label || left?.id || "").localeCompare(String(right?.label || right?.id || ""));
          } else if (normalizedTabId === "agent" && normalizedSortId === "intelligence") {
            const leftLevel = getPlaygroundAgentIntelligenceLevel(left?.intelligence || left?.intelligenceLabel || "");
            const rightLevel = getPlaygroundAgentIntelligenceLevel(right?.intelligence || right?.intelligenceLabel || "");
            comparison = leftLevel - rightLevel;
          } else if (normalizedTabId === "agent" && normalizedSortId.startsWith("cost-")) {
            const priceKey = normalizedSortId === "cost-output" ? "output" : normalizedSortId === "cost-cached" ? "cached" : "input";
            const readPrice = (model) => {
              const value = String(getPlaygroundManagedAgentPricingCells(model)?.[priceKey] || "");
              const match = value.replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/);
              return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
            };
            comparison = readPrice(left) - readPrice(right);
          } else if (normalizedSortId === "cost") {
            const leftCost = getPlaygroundManagedModelPricingRank(normalizedTabId, left);
            const rightCost = getPlaygroundManagedModelPricingRank(normalizedTabId, right);
            comparison = leftCost - rightCost;
          } else if (normalizedTabId === "agent" && normalizedSortId === "context") {
            const leftContext = readPlaygroundManagedModelContextValue(left);
            const rightContext = readPlaygroundManagedModelContextValue(right);
            comparison = leftContext - rightContext;
          } else if (normalizedSortId === "speed") {
            const leftSpeed = readPlaygroundManagedModelSpeedRank(left);
            const rightSpeed = readPlaygroundManagedModelSpeedRank(right);
            comparison = leftSpeed - rightSpeed;
          } else if (normalizedSortId === "capability") {
            comparison = String(
              normalizedTabId === "video"
                ? left?.maxDuration || ""
                : normalizedTabId === "agent"
                  ? left?.intelligence || left?.intelligenceLabel || ""
                  : left?.mode || ""
            ).localeCompare(String(
              normalizedTabId === "video"
                ? right?.maxDuration || ""
                : normalizedTabId === "agent"
                  ? right?.intelligence || right?.intelligenceLabel || ""
                  : right?.mode || ""
            ));
          } else if (normalizedSortId === "scope") {
            comparison = String(
              normalizedTabId === "video" ? left?.resolutions || "" : left?.contextWindow || ""
            ).localeCompare(String(
              normalizedTabId === "video" ? right?.resolutions || "" : right?.contextWindow || ""
            ));
          }
          if (comparison !== 0) return comparison * directionMultiplier;
          const leftProvider = getPlaygroundManagedModelProviderLabel(normalizedTabId, left);
          const rightProvider = getPlaygroundManagedModelProviderLabel(normalizedTabId, right);
          if (leftProvider !== rightProvider) return leftProvider.localeCompare(rightProvider) * directionMultiplier;
          return String(left?.label || left?.id || "").localeCompare(String(right?.label || right?.id || "")) * directionMultiplier;
        };
        if (normalizedTabId !== "image" && normalizedTabId !== "video") {
          return rows.slice().sort(compareRows);
        }
        const parentRows = [];
        const orphanSubrows = [];
        const subrowsByParentId = new Map();
        rows.forEach((row) => {
          if (!row?.isPricingSubrow) {
            parentRows.push(row);
            return;
          }
          const parentId = String(row?.baseModelId || "").trim();
          if (!parentId) {
            orphanSubrows.push(row);
            return;
          }
          const current = subrowsByParentId.get(parentId) || [];
          current.push(row);
          subrowsByParentId.set(parentId, current);
        });
        const sortSubrows = (items) => items.slice().sort((left, right) => {
          const leftRank = Number.isFinite(Number(left?.subrowRank)) ? Number(left.subrowRank) : 99;
          const rightRank = Number.isFinite(Number(right?.subrowRank)) ? Number(right.subrowRank) : 99;
          if (leftRank !== rightRank) return leftRank - rightRank;
          return String(left?.label || "").localeCompare(String(right?.label || ""));
        });
        const orderedRows = [];
        parentRows.slice().sort(compareRows).forEach((row) => {
          orderedRows.push(row);
          const subrows = subrowsByParentId.get(row.id);
          if (Array.isArray(subrows) && subrows.length > 0) {
            orderedRows.push(...sortSubrows(subrows));
            subrowsByParentId.delete(row.id);
          }
        });
        subrowsByParentId.forEach((subrows) => {
          orphanSubrows.push(...subrows);
        });
        return orderedRows.concat(sortSubrows(orphanSubrows));
      }

      async function loadPlaygroundManagedAgentModelCatalog(backendUrl, requestHeaders, setAgentModelOptions) {
        try {
          const response = await fetch(backendUrl + "/agents/models", {
            method: "GET",
            headers: requestHeaders,
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !Array.isArray(data?.models) || data.models.length === 0) {
            setAgentModelOptions(PLAYGROUND_AGENT_MODEL_OPTIONS);
            return;
          }
          const remoteOptions = data.models
            .map((entry) => ({
              id: String(entry?.id || "").trim(),
              label: String(entry?.label || entry?.id || "").trim(),
              description: String(entry?.description || "").trim(),
              intelligence: String(entry?.intelligence || "").trim() || "Custom",
              contextWindow: String(entry?.contextWindow || "").trim() || "Custom",
              speed: String(entry?.speed || "").trim() || "Custom",
              source: String(entry?.source || "managed").trim(),
              providerType: String(entry?.providerType || "").trim(),
              locked: Boolean(entry?.locked),
            }))
            .filter((entry) => entry.id && entry.label);
          const mergedOptionsById = new Map();
          PLAYGROUND_AGENT_MODEL_OPTIONS.forEach((entry) => {
            if (!entry?.id) return;
            mergedOptionsById.set(entry.id, { ...entry });
          });
          remoteOptions.forEach((entry) => {
            if (!entry?.id) return;
            const existing = mergedOptionsById.get(entry.id) || {};
            mergedOptionsById.set(entry.id, {
              ...existing,
              ...entry,
            });
          });
          const nextOptions = Array.from(mergedOptionsById.values()).filter((entry) => entry?.id && entry?.label);
          setAgentModelOptions(nextOptions.length > 0 ? nextOptions : PLAYGROUND_AGENT_MODEL_OPTIONS);
        } catch {
          setAgentModelOptions(PLAYGROUND_AGENT_MODEL_OPTIONS);
        }
      }

      function renderPlaygroundManagedModelsTable(props) {
        const activeTab = normalizePlaygroundManagedModelsTab(props.activeTab);
        const sourceRows = getPlaygroundManagedModelsForTab(activeTab, props.agentModelOptions);
        const normalizedSearchQuery = String(props.searchQuery || "").trim().toLowerCase();
        const providerFilter = String(props.providerFilter || "all").trim() || "all";
        const providerFilterOptions = getPlaygroundManagedModelsProviderFilterOptions(activeTab, sourceRows);
        const sortOptions = getPlaygroundManagedModelsSortOptions(activeTab);
        const normalizedSortDirection = String(props.sortDirection || "asc").trim().toLowerCase() === "desc" ? "desc" : "asc";
        const filteredRows = sourceRows
          .filter((model) => model?.id && model?.label)
          .filter((model) => {
            const providerKey = getPlaygroundManagedModelProviderFilterKey(activeTab, model);
            if (activeTab === "agent" && providerFilter === "available" && model.locked) return false;
            if (activeTab === "agent" && providerFilter === "locked" && !model.locked) return false;
            if (providerFilter !== "all" && providerFilter !== "available" && providerFilter !== "locked" && providerKey !== providerFilter) {
              return false;
            }
            if (!normalizedSearchQuery) return true;
            const agentPricingCells = activeTab === "agent" ? getPlaygroundManagedAgentPricingCells(model) : null;
            const agentTpsValue = activeTab === "agent" ? formatPlaygroundManagedAgentModelTps(model) : null;
            const haystack = [
              model.id,
              model.label,
              model.description,
              model.intelligence,
              model.intelligenceLabel,
              model.contextWindow,
              model.qualityId,
              model.qualityLabel,
              model.speed,
              model.mode,
              model.maxDuration,
              model.resolutions,
              model.inputModalities,
              model.source,
              model.providerType,
              getPlaygroundManagedModelProviderLabel(activeTab, model),
              getPlaygroundManagedModelPricingLabel(activeTab, model),
              agentPricingCells?.input,
              agentPricingCells?.output,
              agentPricingCells?.cached,
              agentTpsValue,
            ].join(" ").toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });
        const visibleRows = sortPlaygroundManagedModels(activeTab, filteredRows, props.sort, normalizedSortDirection);
        const isAgentTab = activeTab === "agent";
        const isVideoTab = activeTab === "video";
        const modelTableVariantClass = activeTab === "deep_research"
          ? " is-deep-research-models"
          : " is-" + activeTab + "-models";
        const capabilityLabel = isVideoTab ? "Max Duration" : isAgentTab ? "Intelligence" : "Mode";
        const scopeLabel = isAgentTab ? "Context" : activeTab === "image" ? "Quality" : activeTab === "video" ? "Resolutions" : "Scope";
        const speedLabel = isVideoTab ? "Input Modalities" : isAgentTab ? "Speed in TPS" : "Speed";
        const pricingLabel = "Pricing";

        const skillSettingsMeta = getPlaygroundManagedModelsSkillSettingsMeta(activeTab);
        const getCapabilityValue = (model) => {
          if (isVideoTab) return model.maxDuration || "Custom";
          if (isAgentTab) return renderPlaygroundManagedModelIntelligence(model);
          return model.mode || "Managed";
        };
        const getScopeValue = (model) => isVideoTab ? model.resolutions || "Custom" : model.contextWindow || "Custom";
        const getSpeedValue = (model) => {
          if (isVideoTab) return model.inputModalities || "Custom";
          if (isAgentTab) return formatPlaygroundManagedAgentModelTps(model);
          return model.speed || "Custom";
        };
        const getPricingValue = (model) => getPlaygroundManagedModelPricingLabel(activeTab, model) || (model?.isPricingSubrow ? "" : "Pricing tiers");
        const featuredModelDefinitions = [
          {
            id: "deepseek-v4-flash",
            displayName: "DeepSeek V4 Flash",
            badge: "Speed & value",
            description: "Fast, cost-efficient execution for high-volume agents and everyday production work.",
            cardClassName: "is-speed",
            Icon: Zap,
            metrics: [
              { label: "Speed", value: (model) => formatPlaygroundManagedAgentModelTps(model) },
              { label: "Input", value: (model) => getPlaygroundManagedAgentPricingCells(model).input + " / mTok" },
              { label: "Context", value: (model) => model?.contextWindow || "Custom" },
            ],
          },
          {
            id: "kimi-k2.7-code",
            displayName: "Kimi K2.7 Code",
            badge: "Coding",
            description: "Maximum coding performance for complex implementation work and long-horizon engineering.",
            cardClassName: "is-code",
            Icon: Code2,
            metrics: [
              { label: "Intelligence", value: (model) => model?.intelligence || model?.intelligenceLabel || "High" },
              { label: "Context", value: (model) => model?.contextWindow || "Custom" },
              { label: "Input", value: (model) => getPlaygroundManagedAgentPricingCells(model).input + " / mTok" },
            ],
          },
          {
            id: "glm-5.2",
            displayName: "GLM 5.2",
            badge: "Agent value",
            description: "Strong autonomous agent performance with excellent throughput at a low operating cost.",
            cardClassName: "is-agent",
            Icon: Bot,
            metrics: [
              { label: "Intelligence", value: (model) => model?.intelligence || model?.intelligenceLabel || "Highest" },
              { label: "Speed", value: (model) => formatPlaygroundManagedAgentModelTps(model) },
              { label: "Input", value: (model) => getPlaygroundManagedAgentPricingCells(model).input + " / mTok" },
            ],
          },
          {
            id: "grok-4.5",
            displayName: "Grok 4.5",
            badge: "Frontier",
            description: "Maximum performance and efficient token use for demanding agentic and knowledge work.",
            cardClassName: "is-frontier",
            Icon: Sparkles,
            metrics: [
              { label: "Intelligence", value: (model) => model?.intelligence || model?.intelligenceLabel || "Highest" },
              { label: "Speed", value: (model) => formatPlaygroundManagedAgentModelTps(model) },
              { label: "Context", value: (model) => model?.contextWindow || "Custom" },
            ],
          },
        ];
        const agentCatalogRows = getPlaygroundManagedModelsForTab("agent", props.agentModelOptions);
        const featuredModels = featuredModelDefinitions
          .map((definition) => ({
            ...definition,
            model: agentCatalogRows.find((model) => String(model?.id || "") === definition.id) || null,
          }))
          .filter((entry) => entry.model);

        const renderFeaturedModelsSection = () => {
          if (!isAgentTab || featuredModels.length === 0) return null;
          return React.createElement("section", {
              className: "playground-models-featured-section",
              "aria-labelledby": "playground-models-featured-title",
            },
            React.createElement("div", { className: "playground-models-featured-header" },
              React.createElement("h2", { id: "playground-models-featured-title", className: "playground-models-featured-title" }, "Featured Models"),
              React.createElement("p", { className: "playground-models-featured-caption" }, "Recommended for production agents")
            ),
            React.createElement("div", { className: "playground-models-featured-grid" },
              featuredModels.map((entry) => {
                const providerLabel = getPlaygroundManagedModelProviderLabel("agent", entry.model);
                const RecommendationIcon = entry.Icon;
                return React.createElement("article", {
                    key: entry.id,
                    className: "playground-models-featured-card " + entry.cardClassName,
                  },
                  React.createElement("div", { className: "playground-models-featured-card-top" },
                    React.createElement("div", { className: "playground-models-featured-provider" },
                      React.createElement("span", { className: "playground-models-featured-provider-icon", "aria-hidden": "true" },
                        renderPlaygroundManagedModelProviderIcon("agent", entry.model)
                      ),
                      React.createElement("span", { className: "playground-models-featured-provider-label" }, providerLabel)
                    ),
                    React.createElement("span", { className: "playground-models-featured-badge" },
                      React.createElement(RecommendationIcon, { width: 11, height: 11, strokeWidth: 1.9 }),
                      React.createElement("span", null, entry.badge)
                    )
                  ),
                  React.createElement("h3", { className: "playground-models-featured-name" }, entry.displayName),
                  React.createElement("p", { className: "playground-models-featured-description" }, entry.description),
                  React.createElement("div", { className: "playground-models-featured-metrics" },
                    entry.metrics.map((metric) => {
                      const value = metric.value(entry.model);
                      return React.createElement("div", { key: metric.label, className: "playground-models-featured-metric" },
                        React.createElement("span", { className: "playground-models-featured-metric-label" }, metric.label),
                        React.createElement("span", { className: "playground-models-featured-metric-value", title: value }, value)
                      );
                    })
                  )
                );
              })
            )
          );
        };

        const closeToolbarPopover = () => {
          const openMenu = String(props.toolbarPopover || "").trim();
          if (!openMenu) return;
          if (typeof props.setToolbarPopoverClosing === "function") props.setToolbarPopoverClosing(openMenu);
          props.setToolbarPopover("");
          window.setTimeout(() => {
            if (typeof props.setToolbarPopoverClosing === "function") props.setToolbarPopoverClosing("");
          }, 160);
        };
        const toggleToolbarPopover = (menuId) => {
          if (props.toolbarPopover === menuId) {
            closeToolbarPopover();
            return;
          }
          if (typeof props.setToolbarPopoverClosing === "function") props.setToolbarPopoverClosing("");
          props.setToolbarPopover(menuId);
        };
        const setModelSort = (sortId, direction) => {
          props.setSort(sortId);
          if (typeof props.setSortDirection === "function") {
            props.setSortDirection(String(direction || "asc").toLowerCase() === "desc" ? "desc" : "asc");
          }
        };
        const handleColumnSort = (sortId) => {
          const nextDirection = props.sort === sortId && normalizedSortDirection === "asc" ? "desc" : "asc";
          setModelSort(sortId, nextDirection);
          closeToolbarPopover();
        };
        const renderSortIcon = (sortId) => {
          const isActive = props.sort === sortId;
          return React.createElement("span", {
              className: "playground-agents-overview-sort-icon"
                + (isActive ? " is-active" : "")
                + (isActive && normalizedSortDirection === "asc" ? " is-ascending" : "")
                + (isActive && normalizedSortDirection === "desc" ? " is-descending" : ""),
              "aria-hidden": "true",
            },
            React.createElement(ChevronsUpDown, { className: "playground-agents-overview-sort-icon-layer is-top", width: 14, height: 14, strokeWidth: 1.8 }),
            React.createElement(ChevronsUpDown, { className: "playground-agents-overview-sort-icon-layer is-bottom", width: 14, height: 14, strokeWidth: 1.8 })
          );
        };
        const renderSortableHeader = (label, sortId, className = "") => {
          const isActive = props.sort === sortId;
          const nextDirection = isActive && normalizedSortDirection === "asc" ? "descending" : "ascending";
          return React.createElement("div", {
              className: "playground-agents-overview-sortable-header" + (isActive ? " is-active" : "") + (className ? " " + className : ""),
            },
            React.createElement("span", { className: "playground-agents-overview-sortable-header-label" }, label),
            React.createElement("button", {
                type: "button",
                className: "playground-agents-overview-column-sort-button"
                  + (isActive ? " is-active" : "")
                  + (isActive && normalizedSortDirection === "asc" ? " is-ascending" : "")
                  + (isActive && normalizedSortDirection === "desc" ? " is-descending" : ""),
                title: "Sort " + label + " " + nextDirection,
                "aria-label": "Sort " + label + " " + nextDirection,
                "aria-pressed": isActive ? "true" : "false",
                onClick: (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleColumnSort(sortId);
                },
              },
              renderSortIcon(sortId)
            )
          );
        };
        const getToolbarMenuClassName = (menuId) =>
          "tb-popup-menu playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-models-overview-menu"
          + (props.toolbarPopoverClosing === menuId ? " is-closing" : " playground-tasks-toolbar-popup-menu-animate-down-in");

        const renderSortMenu = () => props.toolbarPopover === "sort" || props.toolbarPopoverClosing === "sort"
          ? React.createElement("div", { className: getToolbarMenuClassName("sort") },
              sortOptions.map((option) =>
                React.createElement("button", {
                    key: option.id,
                    type: "button",
                    className: "tb-popup-row tb-popup-row-select"
                      + (props.sort === option.id && normalizedSortDirection === String(option.direction || "asc") ? " selected" : ""),
                    onClick: () => {
                      setModelSort(option.id, option.direction);
                      closeToolbarPopover();
                    },
                  },
                  React.createElement("span", { className: "tb-popup-check-slot" },
                    props.sort === option.id && normalizedSortDirection === String(option.direction || "asc")
                      ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                      : null
                  ),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, option.label)
                  )
                )
              )
            )
          : null;

        const renderFilterMenu = () => props.toolbarPopover === "filter" || props.toolbarPopoverClosing === "filter"
          ? React.createElement("div", { className: getToolbarMenuClassName("filter") },
              providerFilterOptions.map((option) =>
                React.createElement("button", {
                    key: option.id,
                    type: "button",
                    className: "tb-popup-row tb-popup-row-select" + (providerFilter === option.id ? " selected" : ""),
                    onClick: () => {
                      props.setProviderFilter(option.id);
                      closeToolbarPopover();
                    },
                  },
                  React.createElement("span", { className: "tb-popup-check-slot" },
                    providerFilter === option.id
                      ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                      : null
                  ),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, option.label)
                  )
                )
              )
            )
          : null;

        const renderModelRow = (model) => {
          const providerLabel = getPlaygroundManagedModelProviderLabel(activeTab, model);
          const pricingCells = isAgentTab ? getPlaygroundManagedAgentPricingCells(model) : null;
          return React.createElement("div", {
              key: activeTab + ":table:" + model.id,
              className: "playground-project-overview-threads-table-row playground-models-overview-table-row"
                + (isAgentTab ? " is-agent-pricing" : "")
                + modelTableVariantClass
                + (model.isPricingSubrow ? " is-pricing-subrow" : ""),
            },
            React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell is-name" },
              React.createElement("div", { className: "playground-files-entry-main playground-models-entry-main" },
                model.isPricingSubrow ? null : renderPlaygroundManagedModelProviderIcon(activeTab, model),
                React.createElement("div", { className: "playground-files-entry-copy" },
                  React.createElement("div", {
                    className: "playground-files-entry-name",
                    title: model.label || model.id,
                  }, model.label || model.id)
                )
              )
            ),
            React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell" },
              React.createElement("div", { className: "playground-models-entry-value is-strong", title: providerLabel }, providerLabel)
            ),
            React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell" },
              React.createElement("div", { className: "playground-models-entry-value" }, getCapabilityValue(model))
            ),
            React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell" },
              React.createElement("div", { className: "playground-models-entry-value", title: getScopeValue(model) }, getScopeValue(model))
            ),
            React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell" },
              React.createElement("div", { className: "playground-models-entry-value", title: getSpeedValue(model) }, getSpeedValue(model))
            ),
            ...(isAgentTab
              ? [
                  React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell is-right" },
                    React.createElement("div", { className: "playground-models-entry-value is-right is-strong is-price", title: pricingCells.input }, pricingCells.input)
                  ),
                  React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell is-right" },
                    React.createElement("div", { className: "playground-models-entry-value is-right is-strong is-price", title: pricingCells.output }, pricingCells.output)
                  ),
                  React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell is-right" },
                    React.createElement("div", { className: "playground-models-entry-value is-right is-strong is-price", title: pricingCells.cached }, pricingCells.cached)
                  ),
                ]
              : [
                  React.createElement("div", { className: "playground-project-overview-thread-cell playground-models-overview-cell is-right" },
                    React.createElement("div", { className: "playground-models-entry-value is-right is-strong", title: getPricingValue(model) }, getPricingValue(model))
                  ),
                ])
          );
        };

        const renderModelCard = (model) => {
          const providerLabel = getPlaygroundManagedModelProviderLabel(activeTab, model);
          const pricingValue = getPricingValue(model);
          const pricingCells = isAgentTab ? getPlaygroundManagedAgentPricingCells(model) : null;
          return React.createElement("div", {
              key: activeTab + ":card:" + model.id,
              className: "playground-files-grid-item playground-models-grid-item"
                + (isAgentTab ? " is-agent-pricing" : "")
                + (model.isPricingSubrow ? " is-pricing-subrow" : ""),
            },
            React.createElement("div", { className: "playground-models-grid-card-top" },
              React.createElement("div", { className: "playground-models-grid-provider", title: providerLabel },
                model.isPricingSubrow ? null : renderPlaygroundManagedModelProviderIcon(activeTab, model),
                React.createElement("span", null, providerLabel)
              ),
              pricingValue
                ? React.createElement("div", { className: "playground-models-grid-price", title: pricingValue }, pricingValue)
                : null
            ),
            React.createElement("div", {
              className: "playground-files-grid-item-name",
              title: model.label || model.id,
            }, model.label || model.id),
            React.createElement("div", { className: "playground-models-grid-facts" },
              React.createElement("div", { className: "playground-models-grid-fact" },
                React.createElement("span", null, capabilityLabel),
                React.createElement("span", null, getCapabilityValue(model))
              ),
              React.createElement("div", { className: "playground-models-grid-fact" },
                React.createElement("span", null, scopeLabel),
                React.createElement("span", { title: getScopeValue(model) }, getScopeValue(model))
              ),
              React.createElement("div", { className: "playground-models-grid-fact" },
                React.createElement("span", null, speedLabel),
                React.createElement("span", { title: getSpeedValue(model) }, getSpeedValue(model))
              ),
              ...(isAgentTab
                ? [
                    React.createElement("div", { className: "playground-models-grid-fact" },
                      React.createElement("span", null, "Input / mTok"),
                      React.createElement("span", { title: pricingCells.input }, pricingCells.input)
                    ),
                    React.createElement("div", { className: "playground-models-grid-fact" },
                      React.createElement("span", null, "Output / mTok"),
                      React.createElement("span", { title: pricingCells.output }, pricingCells.output)
                    ),
                    React.createElement("div", { className: "playground-models-grid-fact" },
                      React.createElement("span", null, "Cached / mTok"),
                      React.createElement("span", { title: pricingCells.cached }, pricingCells.cached)
                    ),
                  ]
                : [])
            )
          );
        };

        const renderTableHead = () => {
          return React.createElement("div", {
              className: "playground-project-overview-threads-table-header playground-agents-overview-column-header playground-models-overview-column-header"
                + (isAgentTab ? " is-agent-pricing" : "")
                + modelTableVariantClass,
              role: "row",
            },
              React.createElement("div", null, renderSortableHeader("Model", "name")),
              React.createElement("div", null, renderSortableHeader("Provider", "provider")),
              React.createElement("div", null, renderSortableHeader(capabilityLabel, isAgentTab ? "intelligence" : "capability")),
              React.createElement("div", null, renderSortableHeader(scopeLabel, isAgentTab ? "context" : "scope")),
              React.createElement("div", null, renderSortableHeader(speedLabel, "speed")),
              ...(isAgentTab
                ? [
                    React.createElement("div", { className: "is-right" }, renderSortableHeader("Input / mTok", "cost-input")),
                    React.createElement("div", { className: "is-right" }, renderSortableHeader("Output / mTok", "cost-output")),
                    React.createElement("div", { className: "is-right" }, renderSortableHeader("Cached / mTok", "cost-cached")),
                  ]
                : [
                    React.createElement("div", { className: "is-right" }, renderSortableHeader(pricingLabel, "cost")),
                  ])
          );
        };

        const renderModelsContent = () => {
          if (visibleRows.length === 0) {
            return React.createElement("div", { className: "playground-files-state" },
              normalizedSearchQuery || providerFilter !== "all" ? "No matching models found." : "No models available."
            );
          }
          return React.createElement("div", { className: "playground-files-entry-list playground-project-overview-thread-list playground-models-entry-list" },
            renderTableHead(),
            visibleRows.map(renderModelRow)
          );
        };

        const skillSettingsSection = skillSettingsMeta
          ? React.createElement("section", { className: "playground-models-skill-settings-section" },
              React.createElement("div", { className: "playground-models-skill-settings-copy" },
                React.createElement("h3", { className: "playground-models-skill-settings-title" }, skillSettingsMeta.title),
                React.createElement("p", { className: "playground-models-skill-settings-description" }, skillSettingsMeta.description)
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-models-skill-settings-button",
                onClick: () => {
                  if (typeof props.onOpenSkillSettings === "function") {
                    props.onOpenSkillSettings(skillSettingsMeta.skillId);
                  }
                },
              },
                React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, skillSettingsMeta.buttonLabel)
              )
            )
          : null;
        return React.createElement("div", { className: "playground-files-shell playground-models-shell" },
          React.createElement("section", { className: "playground-files-browser playground-models-browser" },
            props.toolbarPopover || props.toolbarPopoverClosing
              ? React.createElement("div", {
                  className: "playground-files-search-backdrop",
                  onClick: closeToolbarPopover,
                })
              : null,
            React.createElement("div", { className: "playground-files-browser-header playground-models-browser-header" },
              React.createElement("div", { className: "playground-files-library-header playground-models-library-header" },
                React.createElement("div", { className: "playground-files-library-title-row" },
                  React.createElement("h1", { className: "playground-files-library-title" }, "Models")
                )
              )
            ),
            React.createElement("div", { className: "playground-files-browser-body playground-models-browser-body" },
              renderFeaturedModelsSection(),
              React.createElement("section", {
                  className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-team-overview-table-section playground-team-grid-table-section playground-models-overview-table-section",
                },
                visibleRows.length === 0
                  ? React.createElement("div", {
                      className: "playground-agents-overview-sticky-table-header playground-team-overview-sticky-table-header playground-models-overview-sticky-table-header",
                    }, renderModelsToolbar())
                  : null,
                visibleRows.length === 0
                  ? React.createElement("div", { className: "playground-plugins-empty" },
                      normalizedSearchQuery || providerFilter !== "all" ? "No matching models found." : "No models available."
                    )
                  : React.createElement("div", {
                      className: "playground-project-overview-threads-table playground-evaluations-runs-table playground-agents-overview-list-table playground-models-overview-table",
                    },
                    React.createElement("div", {
                        className: "playground-agents-overview-sticky-table-header playground-team-overview-sticky-table-header playground-models-overview-sticky-table-header",
                      }, renderModelsToolbar()),
                    renderModelsContent()
                  )
              ),
              skillSettingsSection
            )
          )
        );

        function renderModelsToolbar() {
          return React.createElement("div", {
              className: "playground-develop-server-kind-table-toolbar playground-team-overview-toolbar-row playground-models-overview-toolbar-row",
              ref: props.toolbarRef,
            },
            React.createElement("div", { className: "playground-plugins-search-shell playground-develop-server-kind-search-shell playground-models-overview-search-shell" },
              React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("input", {
                type: "search",
                value: props.searchQuery,
                onChange: (event) => {
                  props.setSearchQuery(event.target.value);
                  if (props.toolbarPopover) closeToolbarPopover();
                },
                className: "playground-plugins-search",
                placeholder: "Search models",
                "aria-label": "Search models",
              })
            ),
            React.createElement("div", { className: "playground-plugins-toolbar-controls playground-models-overview-controls" },
              React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-control-button is-bare is-backlog-sort"
                    + (props.toolbarPopover === "sort" || props.sort !== "provider" || normalizedSortDirection !== "asc" ? " is-active" : ""),
                  onClick: () => toggleToolbarPopover("sort"),
                  title: "Sort models",
                  "aria-expanded": props.toolbarPopover === "sort" ? "true" : "false",
                },
                  React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Sort")
                ),
                renderSortMenu()
              ),
              React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-control-button is-bare is-backlog-filter"
                    + (props.toolbarPopover === "filter" || providerFilter !== "all" ? " is-active" : ""),
                  onClick: () => toggleToolbarPopover("filter"),
                  title: "Filter models",
                  "aria-expanded": props.toolbarPopover === "filter" ? "true" : "false",
                },
                  React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Filter")
                ),
                renderFilterMenu()
              )
            ),
            React.createElement("div", { className: "playground-models-overview-category-row" },
              React.createElement("div", {
                  className: "content-mode-switch playground-agents-list-switch playground-models-overview-category-switch",
                  role: "tablist",
                  "aria-label": "Model categories",
                },
                    getPlaygroundManagedModelsTabs().map((tab) =>
                      React.createElement("button", {
                        key: tab.id,
                        type: "button",
                        role: "tab",
                        className: "content-mode-button" + (activeTab === tab.id ? " is-active" : ""),
                        "aria-selected": activeTab === tab.id ? "true" : "false",
                        onClick: () => {
                          props.setActiveTab(tab.id);
                          props.setToolbarPopover("");
                          if (typeof props.setToolbarPopoverClosing === "function") props.setToolbarPopoverClosing("");
                          props.setProviderFilter("all");
                          setModelSort("provider", "asc");
                        },
                      }, tab.label)
                    )
                  )
            )
          );
        }
      }

      function renderPlaygroundModelsPage(props) {
        const activeTab = normalizePlaygroundManagedModelsTab(props.activeTab);
        return React.createElement("div", { className: "playground-files-page playground-models-page playground-agents-overview-page is-develop-configure-page" },
          renderPlaygroundManagedModelsTable({
            activeTab,
            setActiveTab: props.setActiveTab,
            agentModelOptions: props.agentModelOptions,
            searchQuery: props.searchQuery,
            setSearchQuery: props.setSearchQuery,
            providerFilter: props.providerFilter,
            setProviderFilter: props.setProviderFilter,
            sort: props.sort,
            setSort: props.setSort,
            sortDirection: props.sortDirection,
            setSortDirection: props.setSortDirection,
            toolbarPopover: props.toolbarPopover,
            setToolbarPopover: props.setToolbarPopover,
            toolbarPopoverClosing: props.toolbarPopoverClosing,
            setToolbarPopoverClosing: props.setToolbarPopoverClosing,
            toolbarRef: props.toolbarRef,
            viewMode: props.viewMode,
            setViewMode: props.setViewMode,
            pricingUrl: props.pricingUrl,
            onOpenSkillSettings: props.onOpenSkillSettings,
          })
        );
      }
`;
