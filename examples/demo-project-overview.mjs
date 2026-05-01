export const PROJECT_OVERVIEW_CSS = String.raw`
      .playground-project-overview-view {
        width: min(100%, 56rem);
        margin: 0 auto;
        gap: 24px;
      }

      .playground-project-overview-hero-shell {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
        padding-top: 0;
      }

      .playground-project-overview-summary-surface {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-project-overview-summary-header {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        padding-top: 0;
      }

      .playground-project-overview-summary-icon {
        position: relative;
        overflow: visible;
        width: 60px;
        height: 60px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.96);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-summary-icon::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: 15px;
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

      .playground-project-overview-summary-copy {
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-project-overview-summary-title-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-top: 12px;
        min-height: 40px;
      }

      .playground-project-overview-summary-title {
        margin: 0;
        font-size: 24px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: -0.04em;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-summary-description {
        min-width: 0;
        flex: 1 1 auto;
        max-width: 860px;
        font-size: 12px;
        line-height: 1.7;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-project-overview-summary-description p {
        margin: 0;
      }

      .playground-project-overview-summary-description p + p {
        margin-top: 8px;
      }

      .playground-project-overview-summary-description a {
        color: rgba(255, 255, 255, 0.88);
      }

      .playground-project-overview-summary-description-section.playground-tasks-detail-description {
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-project-overview-summary-description-section.playground-tasks-detail-description::before {
        content: none;
        display: none;
      }

      .playground-project-overview-summary-description-section .playground-tasks-detail-section-header {
        padding: 0 0 12px;
        margin-top: 12px;
        margin-bottom: 12px;
        border-bottom: 0;
      }

      .playground-project-overview-summary-description-section .playground-tasks-detail-description-editor.is-preview {
        min-height: 0;
      }

      .playground-project-overview-summary-description-section .playground-tasks-detail-description-editor.is-preview .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        position: relative;
        inset: auto;
        height: auto;
        min-height: 36px;
      }

      .playground-project-overview-summary-description-section .playground-tasks-detail-description-editor.is-preview .playground-tasks-detail-description-input.is-preview {
        position: absolute;
        inset: 0;
        height: 100% !important;
        min-height: 100%;
        padding-bottom: 0;
      }

      .playground-project-overview-summary-description-section .playground-tasks-detail-description-preview.tb-message-markdown {
        margin-bottom: 0;
      }

      .playground-project-overview-summary-divider {
        width: 100%;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-summary-body {
        width: 100%;
        display: block;
        align-items: start;
      }

      .playground-project-overview-summary-kpis {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-project-overview-summary-kpi {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        text-align: left;
      }

      .playground-project-overview-summary-kpi-heading {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .playground-project-overview-summary-kpi-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.64);
      }

      .playground-project-overview-summary-kpi-value {
        font-size: 18px;
        line-height: 1.1;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-project-overview-summary-kpi-label {
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-project-overview-summary-resources {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        justify-self: end;
        width: min(100%, 380px);
        align-items: flex-end;
      }

      .playground-project-overview-summary-mission-button {
        flex: 0 0 auto;
        margin-left: auto;
      }

      .playground-project-overview-summary-title-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        margin-left: auto;
      }

      .playground-project-overview-summary-title-actions .playground-project-overview-summary-mission-button {
        margin-left: 0;
      }

      .playground-project-overview-summary-strategy-button {
        background: #fff;
        border-color: #fff;
        color: #000;
      }

      .playground-project-overview-summary-strategy-button:hover {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(255, 255, 255, 0.92);
        color: #000;
      }

      .playground-project-overview-summary-mission-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-project-overview-summary-mission-copy {
        display: none;
      }

      .playground-project-overview-summary-resource-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }

      .playground-project-overview-summary-resource-item {
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 2px;
        justify-items: end;
      }

      .playground-project-overview-summary-resource-label {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        min-width: 0;
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-summary-resource-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 20px;
        padding: 0 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        font-size: 11px;
        line-height: 1;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-project-overview-summary-resource-endpoint {
        min-width: 0;
        font-size: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.56);
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-project-overview-summary-footer {
        width: 100%;
        padding-top: 2px;
        margin-bottom: 24px;
      }

      @media (max-width: 1080px) {
        .playground-project-overview-summary-title-row {
          flex-direction: column;
          align-items: flex-start;
        }

        .playground-project-overview-summary-kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .playground-project-overview-summary-actors {
        display: flex;
        align-items: center;
        gap: 22px;
        flex-wrap: wrap;
      }

      .playground-project-overview-summary-actor-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 34px;
        padding: 0;
        border-radius: 0;
        background: none;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-project-overview-summary-actor-avatar {
        width: 26px;
        height: 26px;
      }

      .playground-project-overview-summary-actor-name {
        font-size: 13px;
        line-height: 1.2;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-summary-actor-count {
        font-size: 12px;
        line-height: 1.2;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-project-overview-title {
        margin: 0;
        text-align: center;
        font-size: 40px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: -0.04em;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-description {
        max-width: 760px;
        text-align: center;
        font-size: 15px;
        line-height: 1.7;
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-project-overview-description p {
        margin: 0;
        margin-top: -6px;
      }

      .playground-project-overview-search-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-project-overview-search-shell {
        position: relative;
        width: min(100%, 560px);
      }

      .playground-project-overview-search {
        width: 100%;
        min-height: 38px;
        padding: 0 14px 0 36px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.96);
        font-size: 13px;
        outline: none;
      }

      .playground-project-overview-search::placeholder {
        color: rgba(255, 255, 255, 0.34);
      }

      .playground-project-overview-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.42);
        pointer-events: none;
      }

      .playground-project-overview-chart-grid {
        width: 100%;
        display: block;
      }

      .playground-project-overview-chart-surface {
        width: 100%;
        margin: 24px 0;
        padding: 0;
        border-radius: 0;
        background: transparent;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-project-overview-chart-card {
        box-sizing: border-box;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-chart-card.is-donut {
        min-height: 0;
      }

      .playground-project-overview-integration-facts {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-integration-row {
        grid-template-columns: minmax(0, 1fr) minmax(0, auto);
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-integration-icon {
        width: 12px;
        height: 12px;
      }

      .playground-project-overview-integration-value-button {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
      }

      .playground-project-overview-integration-value-button .playground-tasks-detail-select-trigger-label {
        max-width: min(260px, 42vw);
      }

      .playground-project-overview-integration-chevron {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
      }

      .playground-project-overview-chart-empty {
        min-height: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-project-overview-chart-shell {
        position: relative;
        width: 100%;
        overflow: hidden;
      }

      .playground-project-overview-chart-svg {
        display: block;
      }

      .playground-project-overview-chart-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-project-overview-chart-header-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-project-overview-chart-header .playground-environments-home-comparison-timescale-select {
        border-radius: 999px;
      }

      .playground-project-overview-chart-title {
        font-size: 14px;
        line-height: 1.2;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-chart-tabs {
        display: inline-flex;
        align-items: center;
        gap: 18px;
        min-width: 0;
      }

      .playground-project-overview-chart-tab {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 0 0 6px;
        border: 0;
        border-bottom: 1px solid transparent;
        background: transparent;
        color: rgba(255, 255, 255, 0.5);
        font-size: 13px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-project-overview-chart-tab.is-active {
        border-bottom-color: rgba(255, 255, 255, 0.5);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-chart-tab:hover {
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-project-overview-list-tabs-header {
        justify-content: flex-start;
      }

      .playground-project-overview-list-tabs {
        gap: 20px;
      }

      .playground-project-overview-list-tab {
        font-size: 14px;
      }

      .playground-project-overview-chart-copy {
        font-size: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-project-overview-activity-map {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .playground-project-overview-activity-map-cell {
        border-radius: 3px;
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-project-overview-activity-map-cell.level-1 {
        background: rgba(77, 163, 255, 0.18);
      }

      .playground-project-overview-activity-map-cell.level-2 {
        background: rgba(77, 163, 255, 0.34);
      }

      .playground-project-overview-activity-map-cell.level-3 {
        background: rgba(77, 163, 255, 0.56);
      }

      .playground-project-overview-activity-map-cell.level-4 {
        background: rgba(77, 163, 255, 0.82);
      }

      .playground-project-overview-chart-footer {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-height: 24px;
        margin-top: -10px;
      }

      .playground-project-overview-chart-footer-link {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        line-height: 1;
        font-weight: 500;
        cursor: pointer;
      }

      .playground-project-overview-chart-footer-link:hover {
        color: rgba(255, 255, 255, 0.76);
      }

      .playground-project-overview-view .playground-tasks-project-panel-grid > * {
        grid-column: 1 / -1;
      }

      .playground-project-overview-panel-full {
        grid-column: 1 / -1;
      }

      .playground-project-overview-panel-plain {
        background: transparent;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        padding: 0;
      }

      .playground-project-overview-panel-plain.playground-plugins-section {
        gap: 14px;
      }

      .playground-project-overview-panel-plain .playground-plugins-section-header {
        margin-top: 0;
        align-items: center;
      }

      .playground-project-overview-current-tasks-section > .playground-plugins-section-header {
        margin-top: 0;
        padding-bottom: 0;
        border-bottom: 0;
      }

      .playground-project-overview-current-tasks-section > .playground-tasks-secondary-copy {
        margin-bottom: 32px;
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search-row,
      .playground-project-overview-threads-section .playground-plugins-search-row,
      .playground-project-overview-files-section .playground-plugins-search-row {
        align-items: stretch;
        gap: 8px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search-shell,
      .playground-project-overview-threads-section .playground-plugins-search-shell,
      .playground-project-overview-files-section .playground-plugins-search-shell {
        flex: 0 1 360px;
        width: min(360px, 100%);
        min-width: 0;
        max-width: 360px;
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search,
      .playground-project-overview-threads-section .playground-plugins-search,
      .playground-project-overview-files-section .playground-plugins-search {
        position: relative;
        min-height: 32px;
        font-size: 12px;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search-icon,
      .playground-project-overview-threads-section .playground-plugins-search-icon,
      .playground-project-overview-files-section .playground-plugins-search-icon {
        z-index: 1;
      }

      .playground-project-overview-current-tasks-section .playground-files-control-button,
      .playground-project-overview-threads-section .playground-files-control-button,
      .playground-project-overview-files-section .playground-files-control-button {
        min-height: 32px;
      }

      .playground-project-overview-toolbar-action,
      .playground-project-overview-current-tasks-see-all {
        margin-left: auto;
      }

      .playground-project-overview-empty-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        min-height: 180px;
        padding: 20px 18px;
        margin-bottom: 32px;
        border-radius: 15px;
        border: 1px dashed rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.025);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
        text-align: center;
      }

      .playground-project-overview-empty-card.is-compact {
        min-height: 156px;
      }

      .playground-project-overview-empty-icon {
        width: 24px;
        height: 24px;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-empty-title {
        font-size: 13px;
        line-height: 1.3;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-empty-copy {
        font-size: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-project-overview-empty-action {
        margin-top: 4px;
      }

      .playground-project-overview-panel-plain .playground-plugins-section-title {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 400;
      }

      .playground-project-overview-files-section {
        margin-top: 32px;
        padding: 20px 20px 22px;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.035);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-files-section > .playground-plugins-section-header {
        margin-top: 0;
        padding-bottom: 0;
        border-bottom: 0;
      }

      .playground-project-overview-files-section .playground-plugins-section-title {
        font-size: 13px;
        font-weight: 400;
      }

      .playground-project-overview-files-section .playground-tasks-detail-section-title {
        font-size: 13px;
        font-weight: 400;
      }

      .playground-project-overview-files-section .playground-tasks-attachments {
        gap: 14px;
      }

      .playground-project-overview-resources-block {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-files-section .playground-tasks-attachments-toolbar {
        padding: 0;
      }

      .playground-project-overview-files-section .playground-tasks-attachments-surface.tb-runner-chat {
        padding: 0;
        border: 0;
        background: transparent;
      }

      .playground-project-overview-files-section .playground-tasks-attachments-topline {
        justify-content: center;
      }

      .playground-project-overview-files-section .playground-tasks-attachments-surface.tb-runner-chat .runner-attachments {
        width: 100%;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
      }

      .playground-project-overview-files-activity {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin-bottom: 20px;
      }

      .playground-project-overview-files-table-header,
      .playground-project-overview-files-table-row {
        display: grid;
        grid-template-columns: minmax(0, 2.5fr) minmax(110px, 0.9fr) minmax(120px, 1fr) minmax(84px, 0.7fr) minmax(112px, 0.8fr) 28px;
        align-items: center;
        gap: 16px;
      }

      .playground-project-overview-files-table-header {
        min-height: 34px;
        padding: 0 0 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 11px;
        line-height: 1.4;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.45);
        letter-spacing: 0.02em;
      }

      .playground-project-overview-files-table-row {
        min-height: 50px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .playground-project-overview-file-cell {
        min-width: 0;
      }

      .playground-project-overview-file-cell.is-operation,
      .playground-project-overview-file-cell.is-task,
      .playground-project-overview-file-cell.is-date {
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.56);
        white-space: nowrap;
      }

      .playground-project-overview-file-title-button,
      .playground-project-overview-file-task-button {
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        text-align: left;
      }

      .playground-project-overview-file-title-button:hover,
      .playground-project-overview-file-task-button:hover {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-file-task-button {
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-project-overview-file-cell.is-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-project-overview-files-table .playground-plugin-row-title {
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-project-overview-file-assignee {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .playground-project-overview-file-assignee-name {
        min-width: 0;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.72);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-project-overview-backlog-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 32px;
      }

      .playground-project-overview-current-release-list {
        gap: 14px;
      }

      .playground-project-overview-current-release-section .playground-tasks-backlog-item {
        width: 100%;
      }

      .playground-project-overview-release-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 32px;
      }

      .playground-project-overview-release-card {
        width: 100%;
      }

      .playground-project-overview-release-card .playground-tasks-backlog-title {
        font-size: 12px;
        margin-left: 5px;
      }

      .playground-project-overview-release-icon {
        background: linear-gradient(180deg, rgb(103, 80, 255) 0%, rgba(80, 58, 220, 1) 100%);
      }

      .playground-project-overview-release-meta {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;
        min-width: 0;
        flex: 0 0 auto;
      }

      .playground-project-overview-release-dates {
        font-size: 12px;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.56);
        white-space: nowrap;
      }

      .playground-project-overview-release-settings-button {
        width: 24px;
        min-width: 24px;
        height: 24px;
        padding: 0;
      }

      .playground-project-overview-thread-list {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-project-overview-threads-table {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .playground-project-overview-threads-table-header,
      .playground-project-overview-threads-table-row {
        display: grid;
        grid-template-columns: minmax(0, 2.2fr) minmax(120px, 1fr) minmax(84px, 0.7fr) minmax(112px, 0.8fr) 28px;
        align-items: center;
        gap: 16px;
      }

      .playground-project-overview-threads-table-header {
        min-height: 34px;
        padding: 0 0 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 11px;
        line-height: 1.4;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.45);
        letter-spacing: 0.02em;
      }

      .playground-project-overview-threads-table-row {
        min-height: 50px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        cursor: pointer;
      }

      .playground-project-overview-threads-table-row:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .playground-project-overview-threads-table-row:focus-visible {
        outline: 1px solid rgba(255, 255, 255, 0.16);
        outline-offset: 0;
      }

      .playground-project-overview-thread-cell {
        min-width: 0;
      }

      .playground-project-overview-thread-cell.is-date,
      .playground-project-overview-thread-cell.is-task {
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.56);
        white-space: nowrap;
      }

      .playground-project-overview-thread-cell.is-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-project-overview-thread-assignee {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .playground-project-overview-threads-table .playground-plugin-row-title {
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-project-overview-thread-agent {
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.72);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-project-overview-resources-table {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .playground-project-overview-resources-table-header,
      .playground-project-overview-resources-table-row {
        display: grid;
        grid-template-columns: minmax(0, 1.8fr) minmax(96px, 0.85fr) minmax(0, 1.45fr) minmax(92px, 0.8fr) minmax(112px, 0.8fr);
        align-items: center;
        gap: 16px;
      }

      .playground-project-overview-resources-table-header {
        min-height: 34px;
        padding: 0 0 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 11px;
        line-height: 1.4;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.45);
        letter-spacing: 0.02em;
      }

      .playground-project-overview-resources-table-row {
        min-height: 50px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .playground-project-overview-resource-cell {
        min-width: 0;
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-project-overview-resources-table .playground-plugin-row-title {
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-project-overview-resource-cell.is-type,
      .playground-project-overview-resource-cell.is-status,
      .playground-project-overview-resource-cell.is-date {
        color: rgba(255, 255, 255, 0.56);
        white-space: nowrap;
      }

      .playground-project-overview-resource-cell.is-endpoint {
        color: rgba(255, 255, 255, 0.72);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-project-overview-resource-status {
        text-transform: capitalize;
      }

      .playground-project-overview-threads-section > .playground-plugins-section-header {
        margin-top: 0;
        padding-bottom: 0 !important;
        border-bottom: 0 !important;
      }

      .playground-project-overview-plugin-row {
        padding-left: 0;
        padding-right: 0;
      }

      .playground-project-overview-thread-row {
        padding-left: 0;
        padding-right: 0;
      }

      .playground-project-overview-thread-row .playground-plugin-row-copy {
        min-width: 0;
        flex: 1 1 auto;
      }

      .playground-project-overview-thread-time {
        flex: 0 0 auto;
        font-size: 12px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.48);
        text-align: right;
        white-space: nowrap;
      }

      .playground-project-overview-thread-menu-button {
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.54);
        cursor: pointer;
      }

      .playground-project-overview-thread-menu-button:hover {
        color: rgba(255, 255, 255, 0.88);
      }

      .playground-project-overview-thread-icon {
        position: relative;
        overflow: visible;
        width: 34px;
        height: 34px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.86);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-thread-icon::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: 10px;
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

      .playground-project-overview-inline-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .playground-project-overview-resource-row-main {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-project-overview-resource-copy {
        min-width: 0;
      }

      .playground-project-overview-plugin-logo-shell {
        width: 36px;
        height: 36px;
        flex: 0 0 auto;
      }

      .playground-project-overview-agent-avatar {
        width: 24px;
        height: 24px;
        border-radius: 999px;
        overflow: hidden;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .playground-project-overview-agent-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playground-project-overview-agent-avatar-fallback {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .playground-project-overview-strategy-summary {
        font-size: 13px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.64);
      }

      .playground-project-overview-strategy-preview {
        max-height: 280px;
        overflow: auto;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
      }

      .playground-project-overview-donut-layout {
        display: grid;
        grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
        gap: 24px;
        align-items: center;
      }

      .playground-project-overview-donut-legend {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .playground-project-overview-donut-legend-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .playground-project-overview-donut-swatch {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        flex: 0 0 auto;
        margin-top: 6px;
      }

      .playground-project-overview-donut-legend-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-project-overview-donut-label {
        font-size: 13px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.66);
      }

      .playground-project-overview-donut-value {
        font-size: 18px;
        line-height: 1.2;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-donut-center-label {
        fill: rgba(255, 255, 255, 0.52);
        font-size: 12px;
      }

      .playground-project-overview-donut-center-value {
        fill: rgba(255, 255, 255, 0.96);
        font-size: 18px;
        font-weight: 600;
      }

      @media (max-width: 1100px) {
        .playground-project-overview-summary-body {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-project-overview-summary-kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-project-overview-chart-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-project-overview-donut-layout {
          grid-template-columns: minmax(0, 1fr);
        }
      }
`;

export const PROJECT_OVERVIEW_SCRIPT = String.raw`
        function formatProjectOverviewCt(value) {
          const numericValue = Math.max(0, Number(value || 0));
          if (!Number.isFinite(numericValue) || numericValue <= 0) {
            return "0";
          }
          if (numericValue >= 1000) {
            const compactValue = numericValue >= 10000
              ? Math.round(numericValue / 1000)
              : Math.round((numericValue / 1000) * 10) / 10;
            return String(compactValue).replace(/\.0$/, "") + "k";
          }
          return String(Math.round(numericValue));
        }

        function formatProjectOverviewAxisCt(value) {
          return formatProjectOverviewCt(value) + " CT";
        }

        function getProjectOverviewLocalDayKey(dateLike) {
          const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
          if (Number.isNaN(date.getTime())) {
            return "";
          }
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return year + "-" + month + "-" + day;
        }

        function getProjectOverviewLocalWeekStartKey(dateLike) {
          const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
          if (Number.isNaN(date.getTime())) {
            return "";
          }
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() - date.getDay());
          return getProjectOverviewLocalDayKey(date);
        }

        function getProjectOverviewLocalMonthStartKey(dateLike) {
          const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
          if (Number.isNaN(date.getTime())) {
            return "";
          }
          date.setHours(0, 0, 0, 0);
          date.setDate(1);
          return getProjectOverviewLocalDayKey(date);
        }

        function PlaygroundProjectOverviewResponsiveSvg({ frameClassName, frameHeight, svgHeight, fallbackWidth = 960, ariaLabel, renderOverlay, children }) {
          const frameRef = useRef(null);
          const [measuredWidth, setMeasuredWidth] = useState(0);

          useLayoutEffect(() => {
            const node = frameRef.current;
            if (!node) {
              return undefined;
            }

            const updateWidth = () => {
              const nextWidth = Math.max(1, Math.round(node.clientWidth || fallbackWidth));
              setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
            };

            updateWidth();

            if (typeof ResizeObserver === "undefined") {
              window.addEventListener("resize", updateWidth);
              return () => window.removeEventListener("resize", updateWidth);
            }

            const observer = new ResizeObserver(() => updateWidth());
            observer.observe(node);
            return () => observer.disconnect();
          }, [fallbackWidth]);

          const resolvedSvgWidth = Math.max(1, Math.round(measuredWidth || fallbackWidth));
          const resolvedSvgHeight = Math.max(1, Math.round(svgHeight || frameHeight || 252));

          return React.createElement("div", {
              ref: frameRef,
              className: frameClassName,
              style: frameHeight ? { height: String(frameHeight) + "px" } : undefined,
            },
            typeof renderOverlay === "function"
              ? renderOverlay({
                  svgWidth: resolvedSvgWidth,
                  svgHeight: resolvedSvgHeight,
                })
              : renderOverlay || null,
            React.createElement("svg", {
              className: "playground-project-overview-chart-svg",
              width: resolvedSvgWidth,
              height: resolvedSvgHeight,
              role: "img",
              "aria-label": ariaLabel || "Project overview chart",
            },
              typeof children === "function"
                ? children({
                    svgWidth: resolvedSvgWidth,
                    svgHeight: resolvedSvgHeight,
                  })
                : children
            )
          );
        }

        function renderProjectOverviewMultiStackedChart(config) {
          const labels = Array.isArray(config?.labels) ? config.labels : [];
          const series = Array.isArray(config?.series)
            ? config.series.filter((entry) => entry && Array.isArray(entry.values))
            : [];
          if (!labels.length || !series.length) {
            return React.createElement("div", { className: "playground-project-overview-chart-empty" }, config?.emptyText || "No usage data in this period");
          }

          const frameHeight = 252;
          const baseSvgHeight = 252;
          const marginTop = 12;
          const marginRight = 14;
          const marginBottom = 38;
          const marginLeft = 58;
          const totals = labels.map((_, index) =>
            series.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
          );
          const yMax = Math.max(1, Number(config?.yMax || Math.max(...totals, 1)));
          const gridLineCount = 4;
          const tickFormatter = typeof config?.tickFormatter === "function"
            ? config.tickFormatter
            : (value) => String(Math.round(value));
          const labelStep = Math.max(1, Math.ceil(labels.length / 7));
          const visibleLabelIndexes = (() => {
            const next = [];
            for (let index = 0; index < labels.length; index += labelStep) {
              next.push(index);
            }
            const lastIndex = labels.length - 1;
            if (lastIndex >= 0 && !next.includes(lastIndex)) {
              if (next.length > 0 && lastIndex - next[next.length - 1] < 2) {
                next[next.length - 1] = lastIndex;
              } else {
                next.push(lastIndex);
              }
            }
            return new Set(next);
          })();

          return React.createElement(PlaygroundProjectOverviewResponsiveSvg, {
              frameClassName: "playground-project-overview-chart-shell",
              frameHeight,
              svgHeight: baseSvgHeight,
              fallbackWidth: 1200,
              ariaLabel: config?.ariaLabel || "Project compute usage chart",
            }, ({ svgWidth, svgHeight }) => {
              const plotWidth = svgWidth - marginLeft - marginRight;
              const plotHeight = svgHeight - marginTop - marginBottom;
              const slotWidth = plotWidth / Math.max(labels.length, 1);
              const barWidth = Math.min(24, Math.max(8, slotWidth * 0.56));
              const baselineY = marginTop + plotHeight;

              return React.createElement(React.Fragment, null,
              Array.from({ length: gridLineCount + 1 }).map((_, index) => {
                const y = marginTop + (plotHeight / gridLineCount) * index;
                const tickValue = yMax - (yMax / gridLineCount) * index;
                return React.createElement(React.Fragment, { key: "grid:" + index },
                  React.createElement("line", {
                    x1: marginLeft,
                    y1: y,
                    x2: svgWidth - marginRight,
                    y2: y,
                    stroke: "rgba(255,255,255,0.10)",
                    strokeWidth: "1",
                  }),
                  React.createElement("text", {
                    x: 0,
                    y,
                    textAnchor: "start",
                    dominantBaseline: "middle",
                    fill: "rgba(255,255,255,0.4)",
                    fontSize: "10",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "400",
                  }, tickFormatter(tickValue))
                );
              }),
              labels.map((label, index) => {
                const x = marginLeft + slotWidth * index + (slotWidth - barWidth) / 2;
                const isFirstLabel = index === 0;
                const isLastLabel = index === labels.length - 1;
                const labelX = isFirstLabel
                  ? marginLeft
                  : isLastLabel
                    ? svgWidth - marginRight
                    : marginLeft + slotWidth * index + slotWidth / 2;
                let stackOffsetY = baselineY;
                return React.createElement(React.Fragment, { key: "stack:" + index },
                  series.map((entry, seriesIndex) => {
                    const rawValue = Math.max(0, Number(entry.values[index] || 0));
                    if (rawValue <= 0) {
                      return null;
                    }
                    const segmentHeight = (rawValue / yMax) * plotHeight;
                    stackOffsetY -= segmentHeight;
                    return React.createElement("rect", {
                      key: "segment:" + seriesIndex,
                      x,
                      y: stackOffsetY,
                      width: barWidth,
                      height: Math.max(segmentHeight, 1),
                      rx: "3",
                      fill: entry.color || "rgba(255,255,255,0.8)",
                    });
                  }),
                  visibleLabelIndexes.has(index)
                    ? React.createElement("text", {
                        x: labelX,
                        y: svgHeight - 8,
                        textAnchor: isFirstLabel ? "start" : (isLastLabel ? "end" : "middle"),
                        fill: "rgba(255,255,255,0.4)",
                        fontSize: "10",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "400",
                      }, label)
                    : null
                );
              })
              );
            }
          );
        }

        function renderProjectOverviewActivityMap(config) {
          const cells = Array.isArray(config?.cells) ? config.cells : [];
          const rowCount = Math.max(1, Number(config?.rowCount || 7));
          if (!cells.length) {
            return React.createElement("div", { className: "playground-project-overview-chart-empty" }, config?.emptyText || "No project activity yet");
          }

          const columns = [];
          for (let index = 0; index < cells.length; index += rowCount) {
            columns.push(cells.slice(index, index + rowCount));
          }
          const maxCount = Math.max(0, ...cells.map((cell) => Math.max(0, Number(cell?.count || 0))));

          function resolveLevel(count) {
            const value = Math.max(0, Number(count || 0));
            if (value <= 0 || maxCount <= 0) {
              return 0;
            }
            const ratio = value / maxCount;
            if (ratio >= 0.8) return 4;
            if (ratio >= 0.55) return 3;
            if (ratio >= 0.25) return 2;
            return 1;
          }

          function resolveFill(count) {
            const level = resolveLevel(count);
            if (level === 4) return "rgba(77, 163, 255, 0.9)";
            if (level === 3) return "rgba(77, 163, 255, 0.68)";
            if (level === 2) return "rgba(77, 163, 255, 0.44)";
            if (level === 1) return "rgba(77, 163, 255, 0.24)";
            return "rgba(255, 255, 255, 0.05)";
          }

          const frameHeight = 252;
          const labelBandHeight = 26;
          const outerPaddingX = 0;
          const outerPaddingTop = 0;
          const outerPaddingBottom = 4;
          const gridGapY = 8;
          const labelColumnIndexes = (() => {
            const next = [];
            let previousLabel = "";
            columns.forEach((column, columnIndex) => {
              const label = String(column?.[0]?.label || "").trim();
              if (label && label !== previousLabel) {
                next.push(columnIndex);
                previousLabel = label;
              }
            });
            if (columns.length > 0 && !next.includes(0)) {
              next.unshift(0);
            }
            if (columns.length > 1 && !next.includes(columns.length - 1)) {
              next.push(columns.length - 1);
            }
            return new Set(next);
          })();

          function computeActivityMapLayout(svgWidth, svgHeight) {
            const availableWidth = Math.max(1, svgWidth - (outerPaddingX * 2));
            const gridTop = outerPaddingTop;
            const gridHeight = Math.max(1, svgHeight - gridTop - labelBandHeight - outerPaddingBottom);
            const columnCount = Math.max(1, columns.length);
            const horizontalSize = columnCount > 0 ? availableWidth / columnCount : availableWidth;
            const verticalSize = Math.max(1, (gridHeight - (gridGapY * Math.max(0, rowCount - 1))) / rowCount);
            const cellSize = Math.max(4, Math.min(horizontalSize, verticalSize) - 3);
            const cellRadius = cellSize / 2;
            const stepX = columnCount > 1 ? Math.max(cellSize, (availableWidth - cellSize) / (columnCount - 1)) : 0;
            const verticalContentHeight = (cellSize * rowCount) + (gridGapY * Math.max(0, rowCount - 1));
            const gridOffsetY = gridTop + Math.max(0, (gridHeight - verticalContentHeight) / 2);
            const labelY = gridTop + gridHeight + 8;
            return {
              availableWidth,
              gridTop,
              gridHeight,
              columnCount,
              cellSize,
              cellRadius,
              stepX,
              gridOffsetY,
              labelY,
            };
          }

          return React.createElement("div", { className: "playground-project-overview-activity-map" },
            React.createElement(PlaygroundProjectOverviewResponsiveSvg, {
              frameClassName: "playground-project-overview-chart-shell",
              frameHeight,
              svgHeight: frameHeight,
              fallbackWidth: 1200,
              ariaLabel: config?.ariaLabel || "Project activity map",
            }, ({ svgWidth, svgHeight }) => {
              const {
                availableWidth,
                gridHeight,
                columnCount,
                cellRadius,
                stepX,
                gridOffsetY,
                labelY,
              } = computeActivityMapLayout(svgWidth, svgHeight);
              const cellDiameter = cellRadius * 2;

              return React.createElement(React.Fragment, null,
                columns.map((column, columnIndex) => {
                  const firstCell = column[0] || {};
                  const rawLabelText = labelColumnIndexes.has(columnIndex) ? String(firstCell.label || "") : "";
                  const previousColumn = columnIndex > 0 ? columns[columnIndex - 1] || null : null;
                  const previousLabelText = String(previousColumn?.[0]?.label || "").trim();
                  const labelText = rawLabelText && rawLabelText === previousLabelText ? "" : rawLabelText;
                  const cellCenterX = columnCount > 1
                    ? outerPaddingX + cellRadius + (stepX * columnIndex)
                    : outerPaddingX + (availableWidth / 2);
                  const isFirstLabel = columnIndex === 0;
                  const isLastLabel = columnIndex === columnCount - 1;
                  const labelX = isFirstLabel
                    ? 0
                    : isLastLabel
                      ? svgWidth
                      : cellCenterX;
                  return React.createElement(React.Fragment, { key: "activity-column:" + columnIndex },
                    labelText
                      ? React.createElement("text", {
                          x: labelX,
                          y: labelY,
                          textAnchor: isFirstLabel ? "start" : (isLastLabel ? "end" : "middle"),
                          dominantBaseline: "hanging",
                          fill: "rgba(255,255,255,0.42)",
                          fontSize: "10",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: "400",
                        }, labelText)
                      : null,
                    column.map((cell, rowIndex) =>
                      React.createElement("circle", {
                        key: "cell:" + columnIndex + ":" + rowIndex,
                        cx: cellCenterX,
                        cy: gridOffsetY + cellRadius + (rowIndex * (cellDiameter + gridGapY)),
                        r: cellRadius,
                        fill: resolveFill(cell?.count || 0),
                      })
                    )
                  );
                })
              );
            })
          );
        }

        function renderProjectOverviewDonutChart(config) {
          const items = Array.isArray(config?.items) ? config.items.filter(Boolean) : [];
          const totalValue = Math.max(0, items.reduce((sum, item) => sum + Math.max(0, Number(item.value || 0)), 0));
          const hasData = items.length > 0 && totalValue > 0;
          const valueFormatter = typeof config?.valueFormatter === "function"
            ? config.valueFormatter
            : (value) => formatProjectOverviewCt(value);

          function renderArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
            const startOuterX = cx + outerRadius * Math.cos(startAngle);
            const startOuterY = cy + outerRadius * Math.sin(startAngle);
            const endOuterX = cx + outerRadius * Math.cos(endAngle);
            const endOuterY = cy + outerRadius * Math.sin(endAngle);
            const startInnerX = cx + innerRadius * Math.cos(endAngle);
            const startInnerY = cy + innerRadius * Math.sin(endAngle);
            const endInnerX = cx + innerRadius * Math.cos(startAngle);
            const endInnerY = cy + innerRadius * Math.sin(startAngle);
            const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
            return [
              "M", startOuterX, startOuterY,
              "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuterX, endOuterY,
              "L", startInnerX, startInnerY,
              "A", innerRadius, innerRadius, 0, largeArcFlag, 0, endInnerX, endInnerY,
              "Z",
            ].join(" ");
          }

          const svgWidth = 280;
          const svgHeight = 264;
          const cx = svgWidth / 2;
          const cy = svgHeight / 2;
          const outerRadius = Math.min(svgWidth, svgHeight) * 0.38;
          const innerRadius = outerRadius * 0.58;
          const trackRadius = (outerRadius + innerRadius) / 2;
          const trackStrokeWidth = outerRadius - innerRadius;
          let currentAngle = -Math.PI / 2;

          return React.createElement("div", { className: "playground-project-overview-donut-layout" },
            React.createElement("div", { className: "playground-project-overview-chart-shell" },
              React.createElement("svg", {
                  className: "playground-project-overview-chart-svg",
                  viewBox: "0 0 " + svgWidth + " " + svgHeight,
                  role: "img",
                  "aria-label": config?.ariaLabel || "Project tickets by status",
                },
                React.createElement("circle", {
                  cx,
                  cy,
                  r: trackRadius,
                  fill: "none",
                  stroke: "rgba(255, 255, 255, 0.10)",
                  strokeWidth: trackStrokeWidth,
                }),
                hasData
                  ? items.map((item) => {
                      const value = Math.max(0, Number(item.value || 0));
                      const sliceAngle = (value / totalValue) * Math.PI * 2;
                      const isFullCircleSlice = sliceAngle >= (Math.PI * 2) - 0.0001;
                      const path = isFullCircleSlice
                        ? null
                        : renderArcPath(cx, cy, innerRadius, outerRadius, currentAngle, currentAngle + sliceAngle);
                      currentAngle += sliceAngle;
                      return isFullCircleSlice
                        ? React.createElement("circle", {
                            key: item.id || item.label,
                            cx,
                            cy,
                            r: trackRadius,
                            fill: "none",
                            stroke: item.color,
                            strokeWidth: trackStrokeWidth,
                          })
                        : React.createElement("path", {
                            key: item.id || item.label,
                            d: path,
                            fill: item.color,
                          });
                    })
                  : null,
                React.createElement("text", {
                  x: cx,
                  y: cy - 16,
                  textAnchor: "middle",
                  className: "playground-project-overview-donut-center-label",
                }, config?.centerLabel || "Total"),
                React.createElement("text", {
                  x: cx,
                  y: cy + 6,
                  textAnchor: "middle",
                  className: "playground-project-overview-donut-center-value",
                }, config?.centerValue || String(totalValue))
              )
            ),
            items.length > 0
              ? React.createElement("div", { className: "playground-project-overview-donut-legend" },
                  items.map((item) =>
                    React.createElement("div", { key: "legend:" + (item.id || item.label), className: "playground-project-overview-donut-legend-item" },
                      React.createElement("span", {
                        className: "playground-project-overview-donut-swatch",
                        style: { background: item.color },
                      }),
                      React.createElement("div", { className: "playground-project-overview-donut-legend-copy" },
                        React.createElement("div", { className: "playground-project-overview-donut-label" }, item.label),
                        React.createElement("div", { className: "playground-project-overview-donut-value" }, valueFormatter(item.value || 0))
                      )
                    )
                  )
                )
              : null
          );
        }

        function renderProjectOverviewView() {
          if (!selectedProject) {
            return null;
          }

          const normalizedSelectedProjectId = String(selectedProjectId || selectedProject.id || "").trim();
          const projectOverviewDraft = projectDraft?.id === normalizedSelectedProjectId
            ? projectDraft
            : selectedProject;
          const projectOverviewDescription = String(projectOverviewDraft?.description || "");
          const projectThreads = Array.isArray(projectOverviewThreads) ? projectOverviewThreads : [];
          const normalizedOverviewTasks = Array.isArray(tasks)
            ? tasks.map((task) => normalizePlaygroundTaskRecord(task))
            : [];
          const missionControlSummaryText = String(selectedProjectMissionControl.summary || "").trim()
            || (String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim()
              ? "Mission Control has generated a strategy snapshot for the current project state."
              : "Run Mission Control to generate the first strategy statement and backlog recommendations for this project.");
          const hasStrategyDocument = Boolean(String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim());

          const projectOverviewTimescaleConfig = (() => {
            if (projectOverviewChartTimescale === "day") {
              return {
                key: "day",
                title: "Daily CT by Resource Type",
                bucketCount: 14,
                unit: "day",
              };
            }
            if (projectOverviewChartTimescale === "week") {
              return {
                key: "week",
                title: "Weekly CT by Resource Type",
                bucketCount: 8,
                unit: "week",
              };
            }
            return {
              key: "month",
              title: "Monthly CT by Resource Type",
              bucketCount: 6,
              unit: "month",
            };
          })();

          const projectThreadTimeline = (() => {
            const now = new Date();
            const makeBucketBase = (key, label) => ({
              key,
              label,
              totalCT: 0,
              aiCT: 0,
              runtimeCT: 0,
              otherCT: 0,
            });
            const buckets = [];
            const bucketIndexByKey = new Map();

            if (projectOverviewTimescaleConfig.unit === "day") {
              const endDate = new Date(now);
              endDate.setHours(0, 0, 0, 0);
              for (let index = 0; index < projectOverviewTimescaleConfig.bucketCount; index += 1) {
                const date = new Date(endDate);
                date.setDate(endDate.getDate() - (projectOverviewTimescaleConfig.bucketCount - 1 - index));
                const key = getProjectOverviewLocalDayKey(date);
                const bucket = makeBucketBase(key, date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            } else if (projectOverviewTimescaleConfig.unit === "week") {
              const endWeek = new Date(now);
              endWeek.setHours(0, 0, 0, 0);
              endWeek.setDate(endWeek.getDate() - endWeek.getDay());
              for (let index = 0; index < projectOverviewTimescaleConfig.bucketCount; index += 1) {
                const date = new Date(endWeek);
                date.setDate(endWeek.getDate() - (7 * (projectOverviewTimescaleConfig.bucketCount - 1 - index)));
                const key = getProjectOverviewLocalWeekStartKey(date);
                const bucket = makeBucketBase(key, date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            } else {
              const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              for (let index = 0; index < projectOverviewTimescaleConfig.bucketCount; index += 1) {
                const date = new Date(endMonth.getFullYear(), endMonth.getMonth() - (projectOverviewTimescaleConfig.bucketCount - 1 - index), 1);
                const key = getProjectOverviewLocalMonthStartKey(date);
                const bucket = makeBucketBase(key, date.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            }

            projectThreads.forEach((thread) => {
              const timestamp = Date.parse(String(thread?.updatedAt || thread?.createdAt || ""));
              if (!Number.isFinite(timestamp)) {
                return;
              }
              const threadDate = new Date(timestamp);
              let bucketKey = "";
              if (projectOverviewTimescaleConfig.unit === "day") {
                bucketKey = getProjectOverviewLocalDayKey(threadDate);
              } else if (projectOverviewTimescaleConfig.unit === "week") {
                bucketKey = getProjectOverviewLocalWeekStartKey(threadDate);
              } else {
                bucketKey = getProjectOverviewLocalMonthStartKey(threadDate);
              }
              const bucketIndex = bucketIndexByKey.get(bucketKey);
              if (typeof bucketIndex !== "number") {
                return;
              }
              const totalCT = Math.max(0, Number(readSettingsComputeTokens(thread, "totalCT", "totalCost") || 0));
              const aiCT = Math.max(0, Number(readSettingsComputeTokens(thread, "agentCT", "agentCost") || 0));
              const runtimeCT = Math.max(0, Number(readSettingsComputeTokens(thread, "environmentCT", "environmentCost") || 0));
              const otherCT = Math.max(0, totalCT - aiCT - runtimeCT);
              buckets[bucketIndex].totalCT += totalCT;
              buckets[bucketIndex].aiCT += aiCT;
              buckets[bucketIndex].runtimeCT += runtimeCT;
              buckets[bucketIndex].otherCT += otherCT;
            });

            return buckets;
          })();

          const projectComputeSeries = [
            {
              id: "inference",
              label: "LLM Inference",
              color: "rgb(143,196,255)",
              values: projectThreadTimeline.map((bucket) => bucket.aiCT),
            },
            {
              id: "runtime",
              label: "Computers & Resources",
              color: "rgb(103,80,255)",
              values: projectThreadTimeline.map((bucket) => bucket.runtimeCT),
            },
          ];
          if (projectThreadTimeline.some((bucket) => bucket.otherCT > 0)) {
            projectComputeSeries.push({
              id: "other",
              label: "Other Runtime",
              color: "rgb(94,234,212)",
              values: projectThreadTimeline.map((bucket) => bucket.otherCT),
            });
          }

          const maxProjectDailyCt = Math.max(...projectThreadTimeline.map((bucket) => bucket.totalCT), 1);
          const projectTotalCt = projectThreadTimeline.reduce((sum, bucket) => sum + bucket.totalCT, 0);
          const allOverviewResourceItems = Array.isArray(projectOverviewServerResourcesState?.items)
            ? projectOverviewServerResourcesState.items
            : [];
          const overviewResourceItems = allOverviewResourceItems
            .filter((item) => !normalizedSearchQuery || String(item?.searchText || "").includes(normalizedSearchQuery));
          const projectOverviewIntegrationRows = (() => {
            const integrationOrder = new Map([
              ["github", 0],
              ["notion", 1],
              ["googleDrive", 2],
              ["oneDrive", 3],
            ]);
            return (Array.isArray(PLAYGROUND_TASK_CONNECTOR_OPTIONS) ? PLAYGROUND_TASK_CONNECTOR_OPTIONS : [])
              .slice()
              .sort((left, right) => {
                const leftOrder = integrationOrder.has(left?.key) ? integrationOrder.get(left.key) : 99;
                const rightOrder = integrationOrder.has(right?.key) ? integrationOrder.get(right.key) : 99;
                return leftOrder - rightOrder;
              })
              .map((option) => {
                const selection = getDraftTaskConnectorSelection(option.source, selectedProject);
                return {
                  id: String(option?.key || option?.source || option?.label || ""),
                  source: option?.source || "",
                  label: option?.label || "Integration",
                  selection,
                  value: selection?.valueLabel || "Connect",
                  isEmpty: !selection,
                };
              });
          })();
          const overviewProjectAttachments = Array.isArray(selectedProjectAttachments) ? selectedProjectAttachments : [];
          const hasOverviewProjectAttachments = overviewProjectAttachments.length > 0;
          function openOverviewAttachmentInFiles(attachment) {
            const normalizedPath = normalizeHistoryPath(attachment?.sourcePath || attachment?.workspacePath || "");
            if (!normalizedPath) {
              return;
            }
            if (typeof navigateProjectOverviewFileToFiles === "function") {
              navigateProjectOverviewFileToFiles({
                path: normalizedPath,
                title: attachment?.filename || getHistoryPathName(normalizedPath) || "Untitled file",
                environmentId: attachment?.environmentId || activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                projectId: normalizedSelectedProjectId,
              });
            }
            if (typeof setProjectPreviewedAttachmentId === "function") {
              setProjectPreviewedAttachmentId("");
            }
          }
          const allOverviewProjectFileCount = (() => {
            const next = new Set();
            (projectOverviewFileActivityState?.items || []).forEach((item) => {
              const key = String(item?.path || item?.title || item?.id || "").trim();
              if (key) {
                next.add(key);
              }
            });
            overviewProjectAttachments.forEach((attachment) => {
              const key = String(
                attachment?.sourcePath
                || attachment?.workspacePath
                || attachment?.filename
                || attachment?.id
                || ""
              ).trim();
              if (key) {
                next.add(key);
              }
            });
            return next.size;
          })();
          const projectActivityMapConfig = (() => {
            const now = new Date();
            const unit = projectOverviewTimescaleConfig.unit;
            const cellCount = unit === "day" ? 140 : unit === "week" ? 52 : 24;
            const rowCount = unit === "day" ? 7 : unit === "week" ? 4 : 3;
            const buckets = [];
            const bucketIndexByKey = new Map();
            const activityEvents = [];

            if (unit === "day") {
              const endDate = new Date(now);
              endDate.setHours(0, 0, 0, 0);
              for (let index = 0; index < cellCount; index += 1) {
                const date = new Date(endDate);
                date.setDate(endDate.getDate() - (cellCount - 1 - index));
                const key = getProjectOverviewLocalDayKey(date);
                const bucket = {
                  key,
                  label: date.toLocaleDateString("en-US", { month: "short" }),
                  count: 0,
                };
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            } else if (unit === "week") {
              const endWeek = new Date(now);
              endWeek.setHours(0, 0, 0, 0);
              endWeek.setDate(endWeek.getDate() - endWeek.getDay());
              for (let index = 0; index < cellCount; index += 1) {
                const date = new Date(endWeek);
                date.setDate(endWeek.getDate() - (7 * (cellCount - 1 - index)));
                const key = getProjectOverviewLocalWeekStartKey(date);
                const bucket = {
                  key,
                  label: date.toLocaleDateString("en-US", { month: "short" }),
                  count: 0,
                };
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            } else {
              const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              for (let index = 0; index < cellCount; index += 1) {
                const date = new Date(endMonth.getFullYear(), endMonth.getMonth() - (cellCount - 1 - index), 1);
                const key = getProjectOverviewLocalMonthStartKey(date);
                const bucket = {
                  key,
                  label: date.toLocaleDateString("en-US", { month: "short" }),
                  count: 0,
                };
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            }

            function pushActivityTimestamp(value) {
              const timestamp = Date.parse(String(value || ""));
              if (Number.isFinite(timestamp)) {
                activityEvents.push(timestamp);
              }
            }

            projectThreads.forEach((thread) => {
              pushActivityTimestamp(thread?.updatedAt || thread?.createdAt || "");
            });

            normalizedOverviewTasks.forEach((task) => {
              pushActivityTimestamp(task?.updatedAt || task?.createdAt || "");
            });

            (projectOverviewFileActivityState?.items || []).forEach((item) => {
              const numericTimestamp = Number(item?.timestamp || 0);
              if (Number.isFinite(numericTimestamp) && numericTimestamp > 0) {
                activityEvents.push(numericTimestamp);
              }
            });

            allOverviewResourceItems.forEach((resource) => {
              pushActivityTimestamp(resource?.updatedAt || resource?.createdAt || "");
            });

            activityEvents.forEach((timestamp) => {
              const date = new Date(timestamp);
              const bucketKey = unit === "day"
                ? getProjectOverviewLocalDayKey(date)
                : unit === "week"
                  ? getProjectOverviewLocalWeekStartKey(date)
                  : getProjectOverviewLocalMonthStartKey(date);
              const bucketIndex = bucketIndexByKey.get(bucketKey);
              if (typeof bucketIndex === "number") {
                buckets[bucketIndex].count += 1;
              }
            });

            const labelIndexes = [];
            let previousLabel = "";
            buckets.forEach((bucket, index) => {
              if (bucket.label && bucket.label !== previousLabel) {
                labelIndexes.push(index);
                previousLabel = bucket.label;
              }
            });
            if (buckets.length > 0 && !labelIndexes.includes(0)) {
              labelIndexes.unshift(0);
            }
            if (buckets.length > 1 && !labelIndexes.includes(buckets.length - 1)) {
              labelIndexes.push(buckets.length - 1);
            }

            return {
              cells: buckets,
              rowCount,
              labelIndexes: Array.from(new Set(labelIndexes)).sort((left, right) => left - right),
            };
          })();
          const visibleOverviewTasks = overviewVisibleTasks.slice(0, 5);
          const normalizedProjectOverviewTaskSearch = String(projectOverviewTaskSearchQuery || "").trim();
          const hasProjectOverviewTaskListFilters = Boolean(
            normalizedSearchQuery
            || normalizedProjectOverviewTaskSearch
            || projectOverviewTaskFilterMode !== "open"
          );
          const overviewCurrentTaskReleaseSections = (() => {
            const sections = [];
            const sectionIndexByKey = new Map();
            visibleOverviewTasks.forEach((task) => {
              const normalizedReleaseId = typeof task?.releaseId === "string" && task.releaseId.trim()
                ? task.releaseId.trim()
                : "";
              const sectionKey = normalizedReleaseId || "__no_release__";
              const releaseRecord = normalizedReleaseId ? (releasesById[normalizedReleaseId] || null) : null;
              let sectionIndex = sectionIndexByKey.get(sectionKey);
              if (sectionIndex === undefined) {
                sectionIndex = sections.length;
                sectionIndexByKey.set(sectionKey, sectionIndex);
                sections.push({
                  key: sectionKey,
                  releaseId: normalizedReleaseId,
                  title: normalizedReleaseId ? (releaseRecord?.name || "Release unavailable") : "All other",
                  tasks: [],
                });
              }
              sections[sectionIndex].tasks.push(task);
            });
            return sections
              .slice()
              .sort((left, right) => {
                const leftIsAllOther = left.key === "__no_release__";
                const rightIsAllOther = right.key === "__no_release__";
                if (leftIsAllOther !== rightIsAllOther) {
                  return leftIsAllOther ? 1 : -1;
                }
                if (leftIsAllOther && rightIsAllOther) {
                  return 0;
                }
                const leftRelease = releasesById[left.releaseId] || { id: left.releaseId, name: left.title };
                const rightRelease = releasesById[right.releaseId] || { id: right.releaseId, name: right.title };
                return typeof compareTaskReleaseOrder === "function"
                  ? compareTaskReleaseOrder(leftRelease, rightRelease)
                  : String(left.title || "").localeCompare(String(right.title || ""));
              });
          })();
          const normalizedProjectOverviewThreadSearch = String(projectOverviewThreadSearchQuery || "").trim().toLowerCase();
          const projectOverviewFilteredThreads = filteredProjectThreads
            .filter((thread) => {
              const status = typeof resolveThreadDisplayStatus === "function"
                ? resolveThreadDisplayStatus(thread?.status, thread?.completedAt || thread?.finishedAt || thread?.endedAt)
                : (thread?.status || "");
              const normalizedStatus = String(status || "").trim().toLowerCase();
              if (projectOverviewThreadFilterMode === "running" && !(typeof isRunningThreadDisplayStatus === "function" ? isRunningThreadDisplayStatus(normalizedStatus) : ["running", "queued", "pending", "scheduled", "starting", "created", "ready"].includes(normalizedStatus))) {
                return false;
              }
              if (projectOverviewThreadFilterMode === "permission" && !(typeof isPendingPermissionThreadDisplayStatus === "function" ? isPendingPermissionThreadDisplayStatus(normalizedStatus) : normalizedStatus === "permission_asked")) {
                return false;
              }
              if (projectOverviewThreadFilterMode === "completed" && !(typeof isCompletedThreadStatus === "function" ? isCompletedThreadStatus(normalizedStatus) : ["completed", "complete", "done", "succeeded", "success", "finished"].includes(normalizedStatus))) {
                return false;
              }
              if (projectOverviewThreadFilterMode === "failed" && !["failed", "cancelled", "canceled"].includes(normalizedStatus)) {
                return false;
              }
              if (!normalizedProjectOverviewThreadSearch) {
                return true;
              }
              const threadParts = typeof getSidebarThreadTitleParts === "function"
                ? getSidebarThreadTitleParts(thread)
                : {
                    safeThread: thread,
                    taskTicketNumber: "",
                    displayThreadTitle: thread?.title || "Untitled thread",
                  };
              const safeThread = threadParts.safeThread || thread;
              const threadActor = typeof getPlaygroundThreadActorInfo === "function"
                ? getPlaygroundThreadActorInfo(safeThread, agentsById, "No agent")
                : { name: safeThread?.agentId || "" };
              const taskPreview = typeof getThreadTaskPreview === "function" ? getThreadTaskPreview(safeThread) : null;
              const haystack = [
                threadParts.displayThreadTitle || safeThread?.title || "",
                safeThread?.id || "",
                threadParts.taskTicketNumber || "",
                threadActor?.name || "",
                status || "",
                taskPreview?.runKind || "",
                typeof formatRelativeThreadTime === "function" ? (formatRelativeThreadTime(safeThread?.updatedAt || safeThread?.createdAt) || "") : "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedProjectOverviewThreadSearch);
            })
            .sort((left, right) => {
              if (projectOverviewThreadSortMode === "title-asc") {
                const leftTitle = typeof getSidebarThreadTitleParts === "function"
                  ? getSidebarThreadTitleParts(left).displayThreadTitle
                  : left?.title;
                const rightTitle = typeof getSidebarThreadTitleParts === "function"
                  ? getSidebarThreadTitleParts(right).displayThreadTitle
                  : right?.title;
                return String(leftTitle || "").localeCompare(String(rightTitle || ""));
              }
              if (projectOverviewThreadSortMode === "created-desc") {
                const leftCreatedAt = Date.parse(String(left?.createdAt || ""));
                const rightCreatedAt = Date.parse(String(right?.createdAt || ""));
                const leftValue = Number.isFinite(leftCreatedAt) ? leftCreatedAt : 0;
                const rightValue = Number.isFinite(rightCreatedAt) ? rightCreatedAt : 0;
                return rightValue - leftValue;
              }
              return typeof compareThreadsByRecent === "function"
                ? compareThreadsByRecent(left, right)
                : String(right?.updatedAt || right?.createdAt || "").localeCompare(String(left?.updatedAt || left?.createdAt || ""));
            });
          const visibleProjectThreads = projectOverviewFilteredThreads.slice(0, Math.max(5, Number(projectOverviewVisibleThreadCount) || 5));
          const hasMoreProjectThreads = projectOverviewFilteredThreads.length > visibleProjectThreads.length;
          const hasProjectOverviewThreadListFilters = Boolean(
            normalizedSearchQuery
            || normalizedProjectOverviewThreadSearch
            || projectOverviewThreadFilterMode !== "all"
          );
          const normalizedProjectOverviewFileSearch = String(projectOverviewFileSearchQuery || "").trim().toLowerCase();
          const getProjectOverviewFileOperationKind = (item) => {
            const normalizedKind = String(item?.operationKind || item?.operation || "").trim().toLowerCase();
            if (normalizedKind.includes("creat") || normalizedKind === "added" || normalizedKind === "add") {
              return "created";
            }
            if (normalizedKind.includes("delet") || normalizedKind === "removed" || normalizedKind === "remove") {
              return "deleted";
            }
            return "modified";
          };
          const filteredProjectFileActivityItems = (projectOverviewFileActivityState?.items || [])
            .filter((item) => {
              if (!normalizedSearchQuery) {
                return true;
              }
              const haystack = [
                item?.title || "",
                item?.path || "",
                item?.operation || "",
                item?.assignee || "",
                item?.taskTicketNumber || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .filter((item) => {
              if (projectOverviewFileFilterMode !== "all" && getProjectOverviewFileOperationKind(item) !== projectOverviewFileFilterMode) {
                return false;
              }
              if (!normalizedProjectOverviewFileSearch) {
                return true;
              }
              const haystack = [
                item?.title || "",
                item?.path || "",
                item?.operation || "",
                item?.assignee || "",
                item?.taskTicketNumber || "",
                item?.dateLabel || "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedProjectOverviewFileSearch);
            })
            .sort((left, right) => {
              if (projectOverviewFileSortMode === "title-asc") {
                return String(left?.title || left?.path || "").localeCompare(String(right?.title || right?.path || ""));
              }
              if (projectOverviewFileSortMode === "operation-asc") {
                const operationOrder = getProjectOverviewFileOperationKind(left).localeCompare(getProjectOverviewFileOperationKind(right));
                if (operationOrder !== 0) {
                  return operationOrder;
                }
                return String(left?.title || left?.path || "").localeCompare(String(right?.title || right?.path || ""));
              }
              const leftTimestamp = Number(left?.timestamp || 0);
              const rightTimestamp = Number(right?.timestamp || 0);
              const leftValue = Number.isFinite(leftTimestamp) ? leftTimestamp : 0;
              const rightValue = Number.isFinite(rightTimestamp) ? rightTimestamp : 0;
              return rightValue - leftValue;
            })
            .slice(0, 12);
          const hasProjectOverviewFileListFilters = Boolean(
            normalizedSearchQuery
            || normalizedProjectOverviewFileSearch
            || projectOverviewFileFilterMode !== "all"
          );
          const projectOverviewKpis = [
            {
              id: "tasks",
              value: String(Number(selectedProjectSummary.tasksCount) || Number(selectedProjectTaskStatusOverview.total) || 0),
              label: "Tasks",
              Icon: ListTodo,
            },
            {
              id: "open",
              value: String(Number(selectedProjectSummary.openTasksCount) || 0),
              label: "Open Tasks",
              Icon: Clock,
            },
            {
              id: "ct",
              value: formatProjectOverviewCt(projectTotalCt) + " CT",
              label: "Spent on Project",
              Icon: Coins,
            },
            {
              id: "resources",
              value: String(allOverviewResourceItems.length),
              label: "Resources",
              Icon: Server,
            },
            {
              id: "files",
              value: String(allOverviewProjectFileCount),
              label: "Files",
              Icon: File,
            },
          ];

          function renderOverviewSectionHeader(title, description, action) {
            return React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, title),
                description
                  ? React.createElement("p", { className: "playground-plugins-section-subtitle" }, description)
                  : null
              ),
              action || null
            );
          }

          function renderProjectOverviewIntegrationRow(row) {
            const rowProjectId = normalizedSelectedProjectId;
            const openProjectConnectorBrowser = (reason, event) => {
              console.info("[connector-debug] project overview integration row open requested", {
                reason,
                source: row.source,
                rowProjectId,
                selectedProjectId: normalizedSelectedProjectId,
                hasRequestHandler: typeof requestProjectConnectorBrowserOpen === "function",
                eventButton: event?.button ?? null,
                eventDetail: event?.detail ?? null,
                eventType: event?.type || "",
                isTrusted: event?.isTrusted ?? null,
              });
              requestProjectConnectorBrowserOpen(row.source, {
                projectId: rowProjectId,
              });
            };
            return React.createElement("button", {
                key: row.id || row.label,
                type: "button",
                className: "playground-tasks-connector-row playground-project-overview-integration-row",
                "data-project-overview-connector-source": row.source,
                "data-project-overview-project-id": rowProjectId,
                onPointerDown: (event) => {
                  console.info("[connector-debug] project overview integration row pointerdown", {
                    source: row.source,
                    rowProjectId,
                    button: event.button,
                    detail: event.detail,
                    isTrusted: event.isTrusted,
                  });
                  if (event.button && event.button !== 0) {
                    console.info("[connector-debug] project overview integration row pointerdown ignored", {
                      source: row.source,
                      rowProjectId,
                      button: event.button,
                    });
                    return;
                  }
                  event.preventDefault();
                  openProjectConnectorBrowser("pointerdown", event);
                },
                onClick: (event) => {
                  console.info("[connector-debug] project overview integration row click", {
                    source: row.source,
                    rowProjectId,
                    detail: event.detail,
                    isTrusted: event.isTrusted,
                  });
                  if (event.detail !== 0) {
                    console.info("[connector-debug] project overview integration row click ignored because pointerdown handled it", {
                      source: row.source,
                      rowProjectId,
                      detail: event.detail,
                    });
                    return;
                  }
                  event.preventDefault();
                  openProjectConnectorBrowser("programmatic-click", event);
                },
              },
              React.createElement("div", { className: "playground-tasks-connector-service" },
                renderTaskConnectorServiceIcon(row.source, "playground-tasks-connector-service-icon playground-project-overview-integration-icon"),
                React.createElement("span", { className: "playground-tasks-connector-service-label" }, row.label)
              ),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                React.createElement("span", {
                  className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger playground-project-overview-integration-value-button" + (row.isEmpty ? " is-empty" : ""),
                  title: row.value,
                },
                  React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, row.value),
                  React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron playground-project-overview-integration-chevron", strokeWidth: 1.8 })
                )
              )
            );
          }

          function renderProjectOverviewTaskToolbarOption({ option, active, onClick }) {
            return React.createElement("button", {
                key: option.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (active ? " selected" : ""),
                onClick,
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                active
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, option.label),
                option.description
                  ? React.createElement("span", null, option.description)
                  : null
              )
            );
          }

          function renderProjectOverviewHeaderResource(resource) {
            return React.createElement("div", {
                key: "resource:" + resource.id,
                className: "playground-project-overview-summary-resource-item",
              },
              React.createElement("div", { className: "playground-project-overview-summary-resource-label" },
                React.createElement("span", null, resource.label),
                React.createElement("span", { className: "playground-project-overview-summary-resource-chip" }, resource.chip)
              ),
              React.createElement("div", { className: "playground-project-overview-summary-resource-endpoint" },
                String(resource.endpoint || "").trim() || String(resource.description || "").trim() || "Internal project resource"
              )
            );
          }

          function renderProjectOverviewActorPill(entry) {
            return React.createElement("div", {
                key: "actor:" + entry.id,
                className: "playground-project-overview-summary-actor-pill",
              },
              typeof renderAgentNameAvatar === "function"
                ? renderAgentNameAvatar(entry.name, "playground-project-overview-agent-avatar playground-project-overview-summary-actor-avatar", entry.photoUrl)
                : null,
              React.createElement("span", { className: "playground-project-overview-summary-actor-name" }, entry.name),
              React.createElement("span", { className: "playground-project-overview-summary-actor-count" }, entry.openCount + " open")
            );
          }

          function renderOverviewTaskRow(task) {
            const taskId = String(task?.id || "").trim();
            const ticketNumber = taskTicketNumbersById[taskId] || task?.ticketNumber || "000";
            const assigneeLabel = typeof getTaskAssigneeName === "function"
              ? getTaskAssigneeName(task?.assigneeAgentId, "Unassigned")
              : "Unassigned";
            const isSubtask = typeof isPlaygroundSubtaskRecord === "function" ? isPlaygroundSubtaskRecord(task) : false;
            const TaskTypeIcon = isSubtask ? Check : Bookmark;
            const isLaunchLocked = typeof isTaskThreadLaunchLocked === "function" ? isTaskThreadLaunchLocked(task) : false;
            const isRunDisabled = Boolean(saveState?.isSaving) || isLaunchLocked;

            return React.createElement("div", {
                key: taskId || ticketNumber,
                className: "playground-tasks-backlog-item",
                role: "button",
                tabIndex: 0,
                style: typeof getPlaygroundTaskColorStyle === "function" ? getPlaygroundTaskColorStyle(task?.taskColor) : undefined,
                onClick: () => taskId && typeof handleSelectTask === "function" && handleSelectTask(taskId),
                onKeyDown: (event) => {
                  if ((event.key === "Enter" || event.key === " ") && taskId && typeof handleSelectTask === "function") {
                    event.preventDefault();
                    handleSelectTask(taskId);
                  }
                },
              },
              React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                React.createElement("div", { className: "playground-tasks-backlog-leading" },
                  React.createElement("div", {
                    className: "playground-tasks-backlog-project-icon " + (isSubtask ? "is-subtask" : "is-task"),
                    "aria-hidden": "true",
                  },
                    React.createElement(TaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 })
                  ),
                  React.createElement("div", { className: "playground-tasks-backlog-main" },
                    typeof renderPlaygroundTaskPriorityIcon === "function"
                      ? renderPlaygroundTaskPriorityIcon(task?.priority, "playground-tasks-backlog-priority")
                      : null,
                    React.createElement("span", { className: "playground-tasks-backlog-ticket" }, ticketNumber),
                    React.createElement("span", {
                      className: "playground-tasks-backlog-title" + (String(task?.status || "").trim() === "done" ? " is-complete" : ""),
                    }, task?.title || "Untitled Task")
                  )
                ),
                React.createElement("div", { className: "playground-tasks-backlog-meta" },
                  React.createElement("div", { className: "playground-tasks-backlog-assignee-shell" },
                    typeof renderTaskAssigneeAvatar === "function"
                      ? renderTaskAssigneeAvatar(task, "playground-tasks-backlog-assignee-avatar")
                      : null,
                    React.createElement("span", { className: "playground-tasks-backlog-assignee" + (task?.assigneeAgentId ? "" : " is-unassigned") }, assigneeLabel)
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-backlog-run-button",
                  "aria-label": "Run task thread",
                  title: "Run thread",
                  disabled: isRunDisabled,
                  onClick: (event) => {
                    event.stopPropagation();
                    if (taskId && typeof handleStartTaskThread === "function") {
                      void handleStartTaskThread(task);
                    } else if (taskId && typeof handleSelectTask === "function") {
                      handleSelectTask(taskId);
                    }
                  },
                },
                  React.createElement(Play, {
                    width: 13,
                    height: 13,
                    strokeWidth: 1.9,
                    fill: "currentColor",
                    "aria-hidden": "true",
                  })
                )
              )
            );
          }

          function renderOverviewThreadRow(thread) {
            const { safeThread, taskTicketNumber, displayThreadTitle } = typeof getSidebarThreadTitleParts === "function"
              ? getSidebarThreadTitleParts(thread)
              : {
                  safeThread: thread,
                  taskTicketNumber: "",
                  displayThreadTitle: thread?.title || "Untitled thread",
                };
            const threadId = String(safeThread?.id || thread?.id || "").trim();
            const threadTaskPreview = typeof getThreadTaskPreview === "function"
              ? getThreadTaskPreview(safeThread)
              : null;
            const threadTaskId = String(threadTaskPreview?.taskId || safeThread?.taskId || "").trim();
            const threadActor = typeof getPlaygroundThreadActorInfo === "function"
              ? getPlaygroundThreadActorInfo(safeThread, agentsById, "No agent")
              : {
                  id: String(safeThread?.agentId || "").trim(),
                  name: String(safeThread?.agentId || "").trim() || "No agent",
                };
            const threadAgentId = String(threadActor?.id || "").trim();
            const threadAgent = threadAgentId && agentsById && agentsById[threadAgentId]
              ? agentsById[threadAgentId]
              : null;
            const threadAgentName = String(threadActor?.name || "").trim() || "No agent";
            const threadAgentPhotoUrl = threadAgent
              ? normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(threadAgent))
              : "";
            const threadDateLabel = typeof formatThreadSearchTimestamp === "function"
              ? (formatThreadSearchTimestamp(typeof resolveThreadSortTimestamp === "function" ? resolveThreadSortTimestamp(safeThread) : (safeThread?.updatedAt || safeThread?.createdAt || "")) || "—")
              : (formatRelativeThreadTime(safeThread?.updatedAt || safeThread?.createdAt) || "—");
            const canManageThread = Boolean(threadId);

            return React.createElement("div", {
                key: threadId || displayThreadTitle,
                className: "playground-project-overview-threads-table-row",
                role: "button",
                tabIndex: 0,
                onClick: () => {
                  if (!threadId) {
                    return;
                  }
                  if (typeof upsertRealThreadRecord === "function") {
                    upsertRealThreadRecord(safeThread);
                  }
                  if (typeof onThreadOpen === "function") {
                    onThreadOpen(threadId, { threadRecord: safeThread });
                  } else if (typeof handleThreadSelect === "function") {
                    handleThreadSelect(threadId);
                  }
                },
                onKeyDown: (event) => {
                  if ((event.key === "Enter" || event.key === " ") && threadId) {
                    event.preventDefault();
                    if (typeof upsertRealThreadRecord === "function") {
                      upsertRealThreadRecord(safeThread);
                    }
                    if (typeof onThreadOpen === "function") {
                      onThreadOpen(threadId, { threadRecord: safeThread });
                    } else if (typeof handleThreadSelect === "function") {
                      handleThreadSelect(threadId);
                    }
                  }
                },
              },
              React.createElement("div", { className: "playground-project-overview-thread-cell" },
                React.createElement("div", { className: "playground-plugin-row-title" }, displayThreadTitle || "Untitled thread")
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell" },
                React.createElement("div", { className: "playground-project-overview-thread-assignee" },
                  threadAgentName && threadAgentName !== "No agent" && typeof renderAgentNameAvatar === "function"
                    ? renderAgentNameAvatar(threadAgentName, "playground-project-overview-agent-avatar", threadAgentPhotoUrl)
                    : null,
                  React.createElement("div", { className: "playground-project-overview-thread-agent" }, threadAgentName)
                )
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-task" },
                threadTaskId
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-file-task-button",
                      onClick: (event) => {
                        event.stopPropagation();
                        typeof handleSelectTask === "function" && handleSelectTask(threadTaskId);
                      },
                    }, taskTicketNumber || "—")
                  : (taskTicketNumber || "—")
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-date" }, threadDateLabel),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-actions" },
                canManageThread
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-thread-menu-button",
                      "aria-label": "Thread actions",
                      onClick: (event) => {
                        event.stopPropagation();
                        if (typeof onThreadOptionsOpen === "function") {
                          onThreadOptionsOpen(event, threadId, { threadRecord: safeThread });
                        } else {
                          if (typeof upsertRealThreadRecord === "function") {
                            upsertRealThreadRecord(safeThread);
                          }
                          typeof openThreadActionMenu === "function" && openThreadActionMenu(event, threadId, safeThread);
                        }
                      },
                    }, React.createElement(Ellipsis, { width: 15, height: 15, strokeWidth: 1.8 }))
                  : null
              )
            );
          }

          function renderOverviewResourceRow(resource) {
            return React.createElement("div", {
                key: resource.id || resource.title,
                className: "playground-project-overview-resources-table-row",
              },
              React.createElement("div", { className: "playground-project-overview-resource-cell" },
                React.createElement("div", { className: "playground-plugin-row-title" }, resource?.title || "Untitled Resource")
              ),
              React.createElement("div", { className: "playground-project-overview-resource-cell is-type" }, resource?.type || "Resource"),
              React.createElement("div", {
                className: "playground-project-overview-resource-cell is-endpoint",
                title: resource?.endpoint || "",
              }, resource?.endpoint || "Internal"),
              React.createElement("div", { className: "playground-project-overview-resource-cell is-status" },
                React.createElement("span", { className: "playground-project-overview-resource-status" }, resource?.status || "draft")
              ),
              React.createElement("div", { className: "playground-project-overview-resource-cell is-date" },
                (typeof formatThreadSearchTimestamp === "function"
                  ? formatThreadSearchTimestamp(resource?.updatedAt || "")
                  : null)
                || formatRelativeThreadTime(resource?.updatedAt || "")
                || "—"
              )
            );
          }

          function renderOverviewFileActivityRow(row) {
            const rowId = String(row?.id || "").trim();
            const taskLabel = String(row?.taskTicketNumber || "").trim() || "—";
            const taskId = String(row?.taskId || "").trim();
            const assigneeId = String(row?.assigneeId || "").trim();
            const assigneeAgent = assigneeId && agentsById && agentsById[assigneeId]
              ? agentsById[assigneeId]
              : null;
            const assigneePhotoUrl = assigneeAgent
              ? normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(assigneeAgent))
              : "";
            const isRowMutating = projectOverviewFileMutationState?.rowId === rowId;
            const isRenaming = isRowMutating && projectOverviewFileMutationState?.action === "rename";
            const isReverting = isRowMutating && projectOverviewFileMutationState?.action === "revert";
            const isDeleting = isRowMutating && projectOverviewFileMutationState?.action === "delete";

            return React.createElement("div", {
                key: rowId || [row?.threadId, row?.stepId, row?.path].filter(Boolean).join(":"),
                className: "playground-project-overview-files-table-row",
              },
              React.createElement("div", { className: "playground-project-overview-file-cell" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-file-title-button",
                  onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(row),
                },
                  React.createElement("div", { className: "playground-plugin-row-title" }, row?.title || "Untitled file")
                )
              ),
              React.createElement("div", { className: "playground-project-overview-file-cell is-operation" }, row?.operation || "Modified"),
              React.createElement("div", { className: "playground-project-overview-file-cell" },
                React.createElement("div", { className: "playground-project-overview-file-assignee" },
                  row?.assignee
                    ? renderAgentNameAvatar(row.assignee, "playground-project-overview-agent-avatar", assigneePhotoUrl)
                    : null,
                  React.createElement("div", { className: "playground-project-overview-file-assignee-name" }, row?.assignee || "No agent")
                )
              ),
              React.createElement("div", { className: "playground-project-overview-file-cell is-task" },
                taskId
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-file-task-button",
                      onClick: () => typeof handleSelectTask === "function" && handleSelectTask(taskId),
                    }, taskLabel)
                  : taskLabel
              ),
              React.createElement("div", { className: "playground-project-overview-file-cell is-date" }, row?.dateLabel || "—"),
              React.createElement("div", { className: "playground-project-overview-file-cell is-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-thread-menu-button",
                  "aria-label": "File actions",
                  onClick: (event) => typeof openProjectOverviewFileMenu === "function" && openProjectOverviewFileMenu(event, row),
                  disabled: isRenaming || isReverting || isDeleting,
                },
                  isRenaming || isReverting || isDeleting
                    ? React.createElement(Loader2, { width: 15, height: 15, strokeWidth: 1.8, className: "sidebar-thread-menu-icon is-spinning" })
                    : React.createElement(Ellipsis, { width: 15, height: 15, strokeWidth: 1.8 })
                )
              )
            );
          }

          function renderProjectOverviewFileMenu() {
            if (!projectOverviewFileMenuState?.row) {
              return null;
            }
            const targetRow = projectOverviewFileMenuState.row;
            const targetRowId = String(targetRow?.id || "").trim();
            const isRowMutating = projectOverviewFileMutationState?.rowId === targetRowId;
            const isRenaming = isRowMutating && projectOverviewFileMutationState?.action === "rename";
            const isReverting = isRowMutating && projectOverviewFileMutationState?.action === "revert";
            const isDeleting = isRowMutating && projectOverviewFileMutationState?.action === "delete";
            const canRevert = Boolean(String(targetRow?.revertTargetStepId || "").trim());

            const content = React.createElement("div", {
                className: "sidebar-thread-popup-scrim",
                onClick: () => typeof closeProjectOverviewFileMenu === "function" && closeProjectOverviewFileMenu(),
              },
              React.createElement("div", {
                className: "sidebar-thread-popup",
                style: {
                  top: projectOverviewFileMenuState.top + "px",
                  left: projectOverviewFileMenuState.left + "px",
                },
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "sidebar-thread-popup-title" }, "File"),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row",
                  onClick: () => typeof handleProjectOverviewFileRename === "function" && handleProjectOverviewFileRename(targetRow),
                  disabled: isRenaming || isReverting || isDeleting,
                },
                  React.createElement(SquarePen, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isRenaming ? "Renaming..." : "Rename file")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row",
                  onClick: () => typeof handleProjectOverviewFileRevert === "function" && handleProjectOverviewFileRevert(targetRow),
                  disabled: !canRevert || isRenaming || isReverting || isDeleting,
                },
                  React.createElement(History, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isReverting ? "Reverting..." : "Revert changes")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row",
                  onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(targetRow),
                  disabled: isRenaming || isReverting || isDeleting,
                },
                  React.createElement(FolderOpen, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, "Show in Files")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row",
                  onClick: () => {
                    if (String(targetRow?.taskId || "").trim() && typeof handleSelectTask === "function") {
                      handleSelectTask(String(targetRow.taskId).trim());
                    }
                    typeof closeProjectOverviewFileMenu === "function" && closeProjectOverviewFileMenu();
                  },
                  disabled: !String(targetRow?.taskId || "").trim() || isRenaming || isReverting || isDeleting,
                },
                  React.createElement(ListTodo, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, "Show Task")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row is-danger",
                  onClick: () => typeof handleProjectOverviewFileDelete === "function" && handleProjectOverviewFileDelete(targetRow),
                  disabled: isRenaming || isReverting || isDeleting,
                },
                  React.createElement(Trash2, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isDeleting ? "Deleting..." : "Delete")
                )
              )
            );
            if (typeof document !== "undefined" && document.body) {
              return createPortal(content, document.body);
            }
            return content;
          }

          return React.createElement("div", { className: "playground-tasks-view-section playground-project-overview-view" },
            React.createElement("div", { className: "playground-project-overview-hero-shell" },
              React.createElement("section", { className: "playground-project-overview-summary-surface" },
                React.createElement("div", { className: "playground-project-overview-summary-header" },
                  React.createElement("div", { className: "playground-project-overview-summary-copy" },
                    React.createElement("div", { className: "playground-project-overview-summary-title-row" },
                      React.createElement("h1", { className: "playground-project-overview-summary-title" }, selectedProject.name || "Untitled Project"),
                      React.createElement("div", { className: "playground-project-overview-summary-title-actions" },
	                        React.createElement("button", {
	                          type: "button",
	                          className: "playground-files-control-button playground-project-overview-summary-mission-button",
	                          onClick: openMissionControlComposer,
	                        },
	                          React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 1.8 }),
	                          React.createElement("span", { className: "playground-project-overview-summary-mission-label" }, "Mission Control")
	                        ),
	                        React.createElement("button", {
	                          type: "button",
	                          className: "playground-files-control-button playground-project-overview-summary-mission-button" + (projectFullAutoState?.enabled && projectFullAutoState.projectId === selectedProjectId ? " is-active" : ""),
	                          onClick: projectFullAutoState?.enabled && projectFullAutoState.projectId === selectedProjectId
	                            ? stopProjectFullAutoMode
	                            : startProjectFullAutoMode,
	                          title: projectFullAutoState?.enabled && projectFullAutoState.projectId === selectedProjectId ? "Stop Full Auto" : "Start Full Auto",
	                        },
	                          React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8, fill: "currentColor" }),
	                          React.createElement("span", { className: "playground-project-overview-summary-mission-label" },
	                            projectFullAutoState?.enabled && projectFullAutoState.projectId === selectedProjectId ? "Stop Auto" : "Full Auto"
	                          )
	                        ),
	                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button",
                          onClick: openMissionControlStrategySidebar,
                        },
                          React.createElement(FileText, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", { className: "playground-project-overview-summary-mission-label" }, "Strategy")
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-project-overview-summary-description-section" },
                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                        React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                          [
                            { id: "bold", label: "Bold", icon: Bold },
                            { id: "italic", label: "Italic", icon: Italic },
                            { id: "underline", label: "Underline", icon: Underline },
                            { id: "list", label: "List", icon: List },
                          ].map((action) =>
                            React.createElement("button", {
                              key: action.id,
                              type: "button",
                              className: "playground-tasks-detail-format-button",
                              title: action.label,
                              "aria-label": action.label,
                              disabled: projectSaveState.isSaving,
                              onMouseDown: (event) => event.preventDefault(),
                              onClick: () => handleProjectDescriptionFormat(action.id),
                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isProjectDescriptionEditing ? " is-editing" : " is-preview") },
                        !isProjectDescriptionEditing
                          ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                              String(projectOverviewDescription || "").trim()
                                ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: projectOverviewDescription,
                                    className: "playground-tasks-detail-description-preview tb-message-markdown",
                                  })
                                : React.createElement("div", {
                                    className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                  }, "Add Description here")
                            )
                          : null,
                        React.createElement("textarea", {
                          ref: projectDescriptionTextareaRef,
                          className: "playground-tasks-detail-description-input " + (isProjectDescriptionEditing ? "is-editing" : "is-preview"),
                          rows: 1,
                          placeholder: isProjectDescriptionEditing ? "Add Description here" : "",
                          value: projectOverviewDescription,
                          onFocus: (event) => {
                            const textarea = event.currentTarget;
                            setProjectDraft((current) => current?.id === normalizedSelectedProjectId
                              ? current
                              : normalizePlaygroundProjectRecord(selectedProject)
                            );
                            setIsProjectDescriptionEditing(true);
                            window.requestAnimationFrame(() => resizeTaskDescriptionTextarea(textarea));
                          },
                          onChange: (event) => {
                            const nextDescription = event.target.value;
                            setProjectDraft((current) => {
                              const baseProject = current?.id === normalizedSelectedProjectId
                                ? current
                                : normalizePlaygroundProjectRecord(selectedProject);
                              return {
                                ...baseProject,
                                description: nextDescription,
                              };
                            });
                            resizeTaskDescriptionTextarea(event.currentTarget);
                          },
                          onBlur: () => {
                            setIsProjectDescriptionEditing(false);
                            if (typeof saveProjectOverviewDescription === "function") {
                              void saveProjectOverviewDescription();
                            }
                          },
                        })
                      ),
                      projectSaveState.error
                        ? React.createElement("div", { className: "playground-environments-error" }, projectSaveState.error)
                        : null
                    )
                  )
                ),
                React.createElement("div", { className: "playground-project-overview-summary-divider" }),
                React.createElement("div", { className: "playground-project-overview-summary-body" },
                  React.createElement("div", { className: "playground-project-overview-summary-kpis" },
                    projectOverviewKpis.map((item) =>
                      React.createElement("div", { key: item.id, className: "playground-project-overview-summary-kpi" },
                        React.createElement("div", { className: "playground-project-overview-summary-kpi-heading" },
                          item.Icon
                            ? React.createElement(item.Icon, { className: "playground-project-overview-summary-kpi-icon", strokeWidth: 1.85 })
                            : null,
                          React.createElement("div", { className: "playground-project-overview-summary-kpi-label" }, item.label)
                        ),
                        React.createElement("div", { className: "playground-project-overview-summary-kpi-value" }, item.value)
                      )
                    )
                  )
                ),
              ),
              React.createElement("div", { className: "playground-project-overview-chart-surface" },
                React.createElement("div", { className: "playground-project-overview-chart-grid" },
                  React.createElement("section", { className: "playground-settings-usage-chart-card playground-project-overview-chart-card" },
                    React.createElement("div", { className: "playground-project-overview-chart-header" },
                      React.createElement("div", { className: "playground-project-overview-chart-header-main" },
                        React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-project-overview-chart-tab" + (projectOverviewChartMode === "cost" ? " is-active" : ""),
                            onClick: () => typeof setProjectOverviewChartMode === "function" && setProjectOverviewChartMode("cost"),
                          }, "Cost by Resource"),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-project-overview-chart-tab" + (projectOverviewChartMode === "activity" ? " is-active" : ""),
                            onClick: () => typeof setProjectOverviewChartMode === "function" && setProjectOverviewChartMode("activity"),
                          }, "Activity")
                        ),
                        React.createElement("div", { className: "playground-environments-home-comparison-timescale" },
                          React.createElement("select", {
                            className: "playground-environments-home-comparison-timescale-select",
                            value: projectOverviewChartTimescale,
                            "aria-label": "Project overview chart timeframe",
                            onChange: (event) => setProjectOverviewChartTimescale(String(event.target.value || "month")),
                          },
                            React.createElement("option", { value: "day" }, "Daily"),
                            React.createElement("option", { value: "week" }, "Weekly"),
                            React.createElement("option", { value: "month" }, "Monthly")
                          )
                        )
                      )
                    ),
                    projectOverviewChartMode === "activity"
                      ? React.createElement(React.Fragment, null,
                          renderProjectOverviewActivityMap({
                            cells: projectActivityMapConfig.cells,
                            rowCount: projectActivityMapConfig.rowCount,
                            labelIndexes: projectActivityMapConfig.labelIndexes,
                            emptyText: "No project activity yet",
                          }),
                          React.createElement("div", { className: "playground-project-overview-chart-footer" },
                            React.createElement("button", {
                              type: "button",
                              className: "playground-project-overview-chart-footer-link",
                              onClick: () => {
                                const normalizedProjectId = String(selectedProjectId || "").trim();
                                const normalizedEnvironmentId = String(
                                  selectedProject?.defaultEnvironmentId
                                  || activeProjectAttachmentEnvironmentId
                                  || ""
                                ).trim();
                                if (typeof onOpenFilesPage === "function") {
                                  onOpenFilesPage({
                                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                                    projectId: normalizedProjectId,
                                    environmentId: normalizedEnvironmentId,
                                    contentMode: "changes",
                                  });
                                }
                              },
                            }, "View all Changes")
                          )
                        )
                      : React.createElement(React.Fragment, null,
                          renderProjectOverviewMultiStackedChart({
                            labels: projectThreadTimeline.map((bucket) => bucket.label),
                            series: projectComputeSeries,
                            yMax: maxProjectDailyCt,
                            tickFormatter: formatProjectOverviewAxisCt,
                            tall: true,
                            ariaLabel: "Project compute token usage by resource type",
                            emptyText: "No project compute usage yet",
                          }),
                          React.createElement("div", {
                            className: "playground-settings-usage-inline-legend",
                            style: { justifyContent: "flex-start" },
                          },
                            projectComputeSeries.map((entry) =>
                              React.createElement("div", { key: entry.id, className: "playground-settings-usage-legend-item" },
                                React.createElement("span", {
                                  className: "playground-settings-usage-legend-swatch",
                                  style: { background: entry.color },
                                }),
                                React.createElement("span", null, entry.label)
                              )
                            )
                          )
                        ),
                    React.createElement("div", { className: "playground-project-overview-integration-facts" },
                      projectOverviewIntegrationRows.map((row) => renderProjectOverviewIntegrationRow(row))
                    )
                  )
                )
              )
            ),
            React.createElement("div", { className: "playground-tasks-project-panel-grid" },
              React.createElement("section", { className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section" },
                React.createElement("div", { className: "playground-plugins-section-header playground-project-overview-list-tabs-header" },
                  React.createElement("div", { className: "playground-project-overview-chart-tabs playground-project-overview-list-tabs" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-chart-tab playground-project-overview-list-tab" + (projectOverviewListMode !== "threads" ? " is-active" : ""),
                      onClick: () => {
                        setProjectOverviewListMode("tasks");
                        setProjectOverviewThreadToolbarPopover("");
                      },
                    }, "Current Tasks"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-chart-tab playground-project-overview-list-tab" + (projectOverviewListMode === "threads" ? " is-active" : ""),
                      onClick: () => {
                        setProjectOverviewListMode("threads");
                        setProjectOverviewTaskToolbarPopover("");
                      },
                    }, "Threads")
                  )
                ),
                projectOverviewListMode === "threads"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-plugins-search-row", ref: projectOverviewThreadsToolbarRef },
                        React.createElement("div", { className: "playground-plugins-search-shell" },
                          React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("input", {
                            type: "search",
                            value: projectOverviewThreadSearchQuery,
                            onChange: (event) => setProjectOverviewThreadSearchQuery(event.target.value),
                            className: "playground-plugins-search",
                            placeholder: "Search threads",
                            "aria-label": "Search project threads",
                          })
                        ),
                        React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                          React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                            React.createElement("button", {
                              type: "button",
                              className: "playground-files-control-button is-bare is-backlog-sort" + (projectOverviewThreadToolbarPopover === "sort" || projectOverviewThreadSortMode !== "recent-desc" ? " is-active" : ""),
                              onClick: () => setProjectOverviewThreadToolbarPopover((current) => current === "sort" ? "" : "sort"),
                              title: activeProjectOverviewThreadSortOption.label,
                            },
                              React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("span", null, "Sort")
                            ),
                            projectOverviewThreadToolbarPopover === "sort"
                              ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                                  projectOverviewThreadSortOptions.map((option) =>
                                    renderProjectOverviewTaskToolbarOption({
                                      option,
                                      active: projectOverviewThreadSortMode === option.id,
                                      onClick: () => {
                                        setProjectOverviewThreadSortMode(option.id);
                                        setProjectOverviewThreadToolbarPopover("");
                                      },
                                    })
                                  )
                                )
                              : null
                          ),
                          React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                            React.createElement("button", {
                              type: "button",
                              className: "playground-files-control-button is-bare is-backlog-filter" + (projectOverviewThreadToolbarPopover === "filter" || projectOverviewThreadFilterMode !== "all" ? " is-active" : ""),
                              onClick: () => setProjectOverviewThreadToolbarPopover((current) => current === "filter" ? "" : "filter"),
                              title: activeProjectOverviewThreadFilterOption.label,
                            },
                              React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("span", null, "Filter")
                            ),
                            projectOverviewThreadToolbarPopover === "filter"
                              ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                                  projectOverviewThreadFilterOptions.map((option) =>
                                    renderProjectOverviewTaskToolbarOption({
                                      option,
                                      active: projectOverviewThreadFilterMode === option.id,
                                      onClick: () => {
                                        setProjectOverviewThreadFilterMode(option.id);
                                        setProjectOverviewThreadToolbarPopover("");
                                      },
                                    })
                                  )
                                )
                            : null
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-control-button playground-project-overview-toolbar-action",
                          onClick: () => typeof setProjectOverviewVisibleThreadCount === "function" && setProjectOverviewVisibleThreadCount((current) => current + 10),
                          disabled: !hasMoreProjectThreads,
                          style: !hasMoreProjectThreads ? { opacity: 0.5 } : undefined,
                        },
                          React.createElement(List, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Show more")
                        )
                      ),
                      projectOverviewFilteredThreads.length > 0
                        ? React.createElement("div", { className: "playground-project-overview-threads-table" },
                            React.createElement("div", { className: "playground-project-overview-threads-table-header" },
                              React.createElement("div", null, "Title"),
                              React.createElement("div", null, "Assignee"),
                              React.createElement("div", null, "Task"),
                              React.createElement("div", null, "Date"),
                              React.createElement("div", null)
                            ),
                            React.createElement("div", { className: "playground-project-overview-thread-list" },
                              visibleProjectThreads.map((thread) => renderOverviewThreadRow(thread))
                            )
                          )
                        : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                            hasProjectOverviewThreadListFilters ? "No matching project threads." : "No project threads yet."
                          )
                    )
                  : React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-plugins-search-row", ref: projectOverviewTasksToolbarRef },
                        React.createElement("div", { className: "playground-plugins-search-shell" },
                          React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("input", {
                            type: "search",
                            value: projectOverviewTaskSearchQuery,
                            onChange: (event) => setProjectOverviewTaskSearchQuery(event.target.value),
                            className: "playground-plugins-search",
                            placeholder: "Search tasks",
                            "aria-label": "Search current tasks",
                          })
                        ),
                        React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                          React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                            React.createElement("button", {
                              type: "button",
                              className: "playground-files-control-button is-bare is-backlog-sort" + (projectOverviewTaskToolbarPopover === "sort" || projectOverviewTaskSortMode !== "default" ? " is-active" : ""),
                              onClick: () => setProjectOverviewTaskToolbarPopover((current) => current === "sort" ? "" : "sort"),
                              title: activeProjectOverviewTaskSortOption.label,
                            },
                              React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("span", null, "Sort")
                            ),
                            projectOverviewTaskToolbarPopover === "sort"
                              ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                                  projectOverviewTaskSortOptions.map((option) =>
                                    renderProjectOverviewTaskToolbarOption({
                                      option,
                                      active: projectOverviewTaskSortMode === option.id,
                                      onClick: () => {
                                        setProjectOverviewTaskSortMode(option.id);
                                        setProjectOverviewTaskToolbarPopover("");
                                      },
                                    })
                                  )
                                )
                              : null
                          ),
                          React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                            React.createElement("button", {
                              type: "button",
                              className: "playground-files-control-button is-bare is-backlog-filter" + (projectOverviewTaskToolbarPopover === "filter" || projectOverviewTaskFilterMode !== "open" ? " is-active" : ""),
                              onClick: () => setProjectOverviewTaskToolbarPopover((current) => current === "filter" ? "" : "filter"),
                              title: activeProjectOverviewTaskFilterOption.label,
                            },
                              React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("span", null, "Filter")
                            ),
                            projectOverviewTaskToolbarPopover === "filter"
                              ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                                  projectOverviewTaskFilterOptions.map((option) =>
                                    renderProjectOverviewTaskToolbarOption({
                                      option,
                                      active: projectOverviewTaskFilterMode === option.id,
                                      onClick: () => {
                                        setProjectOverviewTaskFilterMode(option.id);
                                        setProjectOverviewTaskToolbarPopover("");
                                      },
                                    })
                                  )
                                )
                            : null
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-control-button playground-project-overview-current-tasks-see-all",
                          onClick: () => typeof setTaskView === "function" && setTaskView("backlog"),
                        },
                          React.createElement(ListTodo, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "See all")
                        )
                      ),
                      overviewVisibleTasks.length > 0
                        ? React.createElement("div", { className: "playground-project-overview-backlog-list playground-project-overview-current-release-list" },
                            overviewCurrentTaskReleaseSections.map((section) =>
                              React.createElement("div", {
                                  key: section.key,
                                  className: "playground-tasks-backlog-section playground-project-overview-current-release-section",
                                },
                                React.createElement("div", { className: "playground-tasks-backlog-section-header" },
                                  React.createElement("div", { className: "playground-tasks-backlog-section-copy-group" },
                                    React.createElement("div", { className: "playground-tasks-backlog-section-title" }, section.title)
                                  ),
                                  typeof renderReleaseHeaderMeta === "function"
                                    ? renderReleaseHeaderMeta(section.releaseId ? (releasesById[section.releaseId] || null) : null)
                                    : null
                                ),
                                section.tasks.map((task) => renderOverviewTaskRow(task))
                              )
                            )
                          )
                        : hasProjectOverviewTaskListFilters
                          ? React.createElement("div", { className: "playground-tasks-secondary-copy" },
                              "No matching active tasks."
                            )
                          : React.createElement("div", { className: "playground-project-overview-empty-card is-compact" },
                              React.createElement("div", { className: "playground-project-overview-empty-title" }, "Create your first task"),
                              React.createElement("div", { className: "playground-project-overview-empty-copy" }, "Start the backlog and define the first ticket for this project."),
                              React.createElement("button", {
                                type: "button",
                                className: "playground-tasks-empty-primary-button playground-project-overview-empty-action",
                                onClick: () => typeof setTaskView === "function" && setTaskView("backlog"),
                              },
                                React.createElement(Plus, { width: 12, height: 12, strokeWidth: 2, "aria-hidden": "true" }),
                                React.createElement("span", null, "New Task")
                              )
                            )
                    )
              ),
              React.createElement("section", { className: "playground-tasks-project-panel playground-project-overview-files-section" },
                renderOverviewSectionHeader(
                  "Files",
                  null
                ),
                React.createElement("div", { className: "playground-plugins-search-row", ref: projectOverviewFilesToolbarRef },
                  React.createElement("div", { className: "playground-plugins-search-shell" },
                    React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("input", {
                      type: "search",
                      value: projectOverviewFileSearchQuery,
                      onChange: (event) => setProjectOverviewFileSearchQuery(event.target.value),
                      className: "playground-plugins-search",
                      placeholder: "Search files",
                      "aria-label": "Search project files",
                    })
                  ),
                  React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                    React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-control-button is-bare is-backlog-sort" + (projectOverviewFileToolbarPopover === "sort" || projectOverviewFileSortMode !== "recent-desc" ? " is-active" : ""),
                        onClick: () => setProjectOverviewFileToolbarPopover((current) => current === "sort" ? "" : "sort"),
                        title: activeProjectOverviewFileSortOption.label,
                      },
                        React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Sort")
                      ),
                      projectOverviewFileToolbarPopover === "sort"
                        ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                            projectOverviewFileSortOptions.map((option) =>
                              renderProjectOverviewTaskToolbarOption({
                                option,
                                active: projectOverviewFileSortMode === option.id,
                                onClick: () => {
                                  setProjectOverviewFileSortMode(option.id);
                                  setProjectOverviewFileToolbarPopover("");
                                },
                              })
                            )
                          )
                        : null
                    ),
                    React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-control-button is-bare is-backlog-filter" + (projectOverviewFileToolbarPopover === "filter" || projectOverviewFileFilterMode !== "all" ? " is-active" : ""),
                        onClick: () => setProjectOverviewFileToolbarPopover((current) => current === "filter" ? "" : "filter"),
                        title: activeProjectOverviewFileFilterOption.label,
                      },
                        React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Filter")
                      ),
                      projectOverviewFileToolbarPopover === "filter"
                        ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                            projectOverviewFileFilterOptions.map((option) =>
                              renderProjectOverviewTaskToolbarOption({
                                option,
                                active: projectOverviewFileFilterMode === option.id,
                                onClick: () => {
                                  setProjectOverviewFileFilterMode(option.id);
                                  setProjectOverviewFileToolbarPopover("");
                                },
                              })
                            )
                          )
                      : null
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button playground-project-overview-toolbar-action",
                    onClick: () => {
                      const normalizedProjectId = String(selectedProjectId || "").trim();
                      const normalizedEnvironmentId = String(
                        selectedProject?.defaultEnvironmentId
                        || activeProjectAttachmentEnvironmentId
                        || ""
                      ).trim();
                      if (typeof onOpenFilesPage === "function") {
                        onOpenFilesPage({
                          token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                          projectId: normalizedProjectId,
                          environmentId: normalizedEnvironmentId,
                        });
                      }
                    },
                  },
                    React.createElement(FolderOpen, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Show all on Files")
                  )
                ),
                React.createElement("div", { className: "playground-project-overview-files-activity" },
                  filteredProjectFileActivityItems.length > 0
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-project-overview-files-table-header" },
                          React.createElement("div", null, "File Title"),
                          React.createElement("div", null, "Operation"),
                          React.createElement("div", null, "Modified by"),
                          React.createElement("div", null, "Task"),
                          React.createElement("div", null, "Date"),
                          React.createElement("div", null)
                        ),
                        filteredProjectFileActivityItems.map((row) => renderOverviewFileActivityRow(row))
                      )
                    : projectOverviewFileActivityState?.status === "error"
                        ? React.createElement("div", { className: "playground-environments-error" }, projectOverviewFileActivityState.error || "Failed to load project file activity.")
                        : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                            hasProjectOverviewFileListFilters ? "No matching project file activity." : "No project file activity yet."
                          )
                ),
                projectOverviewFileMutationState?.error
                  ? React.createElement("div", { className: "playground-environments-error" }, projectOverviewFileMutationState.error)
                  : null,
                React.createElement("div", { className: "playground-tasks-attachments" },
                  React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
                    React.createElement("div", { className: "playground-tasks-attachments-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                        onClick: openProjectEnvironmentFilePicker,
                        disabled: projectAttachmentTransferState.isProcessing || !activeProjectAttachmentEnvironmentId,
                        title: activeProjectAttachmentEnvironmentId
                          ? "Add files from " + (activeProjectAttachmentEnvironment?.name || "the selected environment")
                          : "Select an environment first",
                      }, "From Environment")
                    )
                  ),
                  React.createElement("input", {
                    ref: projectAttachmentInputRef,
                    type: "file",
                    multiple: true,
                    hidden: true,
                    onChange: (event) => void handleProjectAttachmentInputChange(event),
                  }),
                  React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                    React.createElement("div", {
                      className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isProjectAttachmentDragging ? " dragging" : "") + (hasOverviewProjectAttachments ? " is-filled" : ""),
                      onDragOver: (event) => {
                        event.preventDefault();
                        if (!activeProjectAttachmentEnvironmentId) {
                          return;
                        }
                        setIsProjectAttachmentDragging(true);
                      },
                      onDragLeave: (event) => {
                        if (event.currentTarget.contains(event.relatedTarget)) {
                          return;
                        }
                        setIsProjectAttachmentDragging(false);
                      },
                      onDrop: (event) => void handleProjectAttachmentDrop(event),
                    },
                      hasOverviewProjectAttachments
                        ? React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "playground-tasks-attachments-topline" },
                              React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                              React.createElement("span", null, isProjectAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                              React.createElement("button", {
                                type: "button",
                                className: "playground-tasks-attachments-browse",
                                onClick: openProjectAttachmentPicker,
                              }, "browse.")
                            ),
                            React.createElement("div", { className: "runner-attachments" },
                              overviewProjectAttachments.map((attachment) =>
                                renderTaskAttachmentChip(attachment, {
                                  removable: true,
                                  activeAttachmentId: projectPreviewedAttachmentId,
                                  onPreview: openOverviewAttachmentInFiles,
                                  onRemove: handleRemoveProjectAttachment,
                                })
                              )
                            )
                          )
                        : React.createElement("button", {
                            type: "button",
                            className: "playground-tasks-attachments-empty-button",
                            onClick: openProjectAttachmentPicker,
                          },
                            React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                            React.createElement("span", { className: "tb-popup-dropzone-title" }, isProjectAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                            React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                          )
                    )
                  ),
                  projectAttachmentTransferState.isProcessing
                    ? React.createElement("div", { className: "playground-tasks-attachments-status" }, "Uploading attachments...")
                    : null,
                  projectAttachmentTransferState.error
                  ? React.createElement("div", { className: "playground-environments-error" }, projectAttachmentTransferState.error)
                  : null
                ),
                React.createElement("div", { className: "playground-project-overview-resources-block" },
                  React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Resources")
                  ),
                  projectOverviewServerResourcesState?.status === "loading"
                    ? React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Loading project resources...")
                    : projectOverviewServerResourcesState?.status === "error"
                      ? React.createElement("div", { className: "playground-tasks-secondary-copy" }, projectOverviewServerResourcesState.error || "Failed to load project resources.")
                      : overviewResourceItems.length > 0
                        ? React.createElement("div", { className: "playground-project-overview-resources-table" },
                            React.createElement("div", { className: "playground-project-overview-resources-table-header" },
                              React.createElement("div", null, "Title"),
                              React.createElement("div", null, "Type"),
                              React.createElement("div", null, "Endpoint"),
                              React.createElement("div", null, "Status"),
                              React.createElement("div", null, "Date")
                            ),
                            overviewResourceItems.slice(0, 12).map((resource) => renderOverviewResourceRow(resource))
                          )
                        : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                            normalizedSearchQuery ? "No matching resources." : "No project resources have been created yet."
                          )
                ),
                renderProjectOverviewFileMenu()
              )
            )
          );
        }
`;
