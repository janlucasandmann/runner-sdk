export const PROJECT_OVERVIEW_CSS_04_FRAGMENT = String.raw`        cursor: pointer;
      }

      .playground-project-resource-template-card:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-project-resource-template-card-icon {
        width: 34px;
        height: 34px;
        border-radius: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-resource-template-actions {
        display: flex;
        justify-content: center;
        margin-top: 2px;
      }

      .playground-project-resource-template-browse-button.playground-project-overview-summary-mission-button {
        margin-left: 0;
      }

      .playground-project-resource-template-card-title {
        font-size: 13px;
        line-height: 1.35;
        font-weight: 500;
      }

      .playground-project-resource-template-card-copy {
        font-size: 12px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-project-resources-table-card {
        position: relative;
        border-radius: 0;
        border: 0;
        background: transparent;
        overflow: visible;
      }

      .playground-project-resources-table-card::before {
        content: none;
      }

      .playground-project-resources-table-inner {
        position: relative;
        z-index: 1;
        border-radius: 0;
        overflow: visible;
        background: transparent;
      }

      .playground-project-resources-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 0 0 12px;
        min-width: 0;
        width: 100%;
      }

      .playground-project-resources-toolbar-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        flex: 0 0 auto;
        min-width: 0;
      }

      .playground-project-resources-toolbar-title-group {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 0 1 auto;
      }

      .playground-project-resources-toolbar-title {
        margin: 0;
        color: #fff;
        font-size: 14px;
        line-height: 1.3;
        font-weight: 400;
        letter-spacing: 0;
        white-space: nowrap;
      }

      .playground-project-resources-toolbar.is-titled .playground-project-resources-toolbar-actions {
        margin-left: auto;
      }

      .playground-project-resources-toolbar .playground-files-library-search {
        flex: 1 1 360px;
        max-width: 360px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #000;
      }

      .playground-project-resources-toolbar .playground-files-library-search::before {
        content: none;
        display: none;
      }

      .playground-project-resources-toolbar .playground-files-library-search-input {
        background: #000;
      }

      .playground-project-resources-toolbar .playground-files-library-new-button {
        height: 32px;
      }

      .playground-project-resources-toolbar .playground-files-library-icon-button {
        width: 30px;
        height: 30px;
      }

      .playground-project-resources-new-shell,
      .playground-project-resources-filter-shell {
        position: relative;
        display: inline-flex;
        justify-content: flex-end;
      }

      .playground-project-resources-new-shell.is-open,
      .playground-project-resources-filter-shell.is-open {
        z-index: 320;
      }

      .playground-project-resources-new-menu,
      .playground-project-resources-filter-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        left: auto;
        min-width: 230px;
        width: max-content;
        max-width: min(300px, calc(100vw - 32px));
        padding: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        background: #323232;
        color: rgba(255, 255, 255, 0.94);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        z-index: 420;
        transform-origin: top right;
      }

      .playground-project-resources-filter-menu.is-central-popup {
        right: auto;
        left: 0;
        width: 230px;
        min-width: 230px;
        transform-origin: top left;
      }

      .playground-project-resources-menu-divider {
        height: 1px;
        margin: 6px 4px;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-project-resources-view-toggle {
        display: flex;
        align-items: center;
        gap: 2px;
        min-height: 34px;
        padding: 2px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
      }

      .playground-project-resources-view-button {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        cursor: pointer;
      }

      .playground-project-resources-view-button.is-active {
        background: rgba(255, 255, 255, 0.16);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-resources-row {
        display: grid;
        grid-template-columns: minmax(0, 1.34fr) minmax(168px, 0.74fr) minmax(82px, 0.34fr) 28px;
        min-height: 54px;
        gap: 12px;
        padding: 12px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        align-items: center;
        width: 100%;
        box-sizing: border-box;
      }

      .playground-project-resources-row.has-source-column {
        grid-template-columns: minmax(220px, 1fr) minmax(76px, 112px) minmax(142px, 220px) minmax(64px, 96px) 28px;
      }

      .playground-project-resources-row.has-source-column.has-owner-column {
        grid-template-columns: minmax(220px, 1fr) minmax(76px, 112px) minmax(142px, 220px) minmax(64px, 96px) minmax(92px, 128px) 28px;
      }

      .playground-team-resources-panel .playground-project-resources-row.has-source-column {
        grid-template-columns: minmax(220px, 1fr) 160px 220px 92px 28px;
        column-gap: 20px;
      }

      .playground-team-resources-panel .playground-project-resources-row.has-source-column.has-owner-column {
        grid-template-columns: minmax(220px, 1fr) 170px 232px 96px 148px 28px;
        column-gap: 18px;
      }

      .playground-project-resources-row.has-source-column > * {
        min-width: 0;
      }

      .playground-team-resources-panel .playground-project-resources-row.has-source-column > :nth-child(2),
      .playground-team-resources-panel .playground-project-resources-row.has-source-column > :nth-child(3),
      .playground-team-resources-panel .playground-project-resources-row.has-source-column.has-owner-column > :nth-child(5) {
        overflow: visible;
        text-overflow: clip;
      }

      button.playground-project-resources-row,
      .playground-project-resources-row[role="button"] {
        border-left: 0;
        border-right: 0;
        border-bottom: 0;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-resources-row.is-menu-open {
        position: relative;
        z-index: 340;
      }

      .playground-project-resources-row:not(.is-header):hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-project-resources-row.is-header {
        min-height: 36px;
        color: rgba(255, 255, 255, 0.44);
        font-size: 11px;
        font-weight: 500;
        cursor: default;
      }

      .playground-project-resource-title-cell {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .playground-project-resource-title-icon {
        width: 34px;
        height: 34px;
        border-radius: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.72);
        background: transparent;
      }

      .playground-project-resource-title-icon .playground-files-entry-icon:not(.is-large):not(.is-thumbnail) {
        width: 34px;
        height: 34px;
        box-sizing: border-box;
        border-radius: 6px;
        border: 0;
        background: transparent;
      }

      .playground-project-resource-title-icon svg.playground-files-entry-icon:not(.is-large):not(.is-thumbnail) {
        padding: 10px;
      }

      .playground-project-resource-title-icon .playground-files-entry-icon.is-asset:not(.is-large):not(.is-thumbnail) {
        padding: 7px;
        object-fit: contain;
      }

      .playground-project-resource-title-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-project-resource-title-main {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.35;
      }

      .playground-project-resource-title-sub,
      .playground-project-resources-cell {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-project-resource-title-sub {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.46);
      }

      .playground-project-resources-creator {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-project-resources-creator-avatar {
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
        border-radius: 999px;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        font-size: 10px;
        line-height: 1;
        font-weight: 600;
      }

      .playground-project-resources-creator-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playground-project-resources-creator-avatar-fallback {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .playground-project-resources-creator-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-resources-row-action {
        position: relative;
        justify-self: end;
        overflow: visible;
        min-width: 0;
      }

      .playground-project-resources-action-shell {
        position: relative;
        display: inline-flex;
        justify-content: flex-end;
        overflow: visible;
      }

      .playground-project-resources-action-shell.is-open {
        z-index: 450;
      }

      .playground-project-resources-action-button {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        cursor: pointer;
      }

      .playground-project-resources-action-button:hover,
      .playground-project-resources-action-shell.is-open .playground-project-resources-action-button {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-resources-action-menu {
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        left: auto;
        min-width: 196px;
        padding: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: #323232;
        color: rgba(255, 255, 255, 0.94);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        z-index: 500;
        transform-origin: top right;
      }

      .playground-project-resources-empty {
        padding: 34px 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        text-align: center;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-project-resources-empty.has-templates {
        padding: 18px 0 20px;
        text-align: left;
      }

      .playground-project-resources-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
        padding: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-project-resources-grid-card {
        min-width: 0;
        min-height: 132px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        padding: 14px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.96);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-resources-grid-card:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-project-resources-grid-card-top {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        min-width: 0;
        width: 100%;
      }

      .playground-project-resources-grid-card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        width: 100%;
        min-width: 0;
      }

      @media (max-width: 1100px) {
        .playground-project-resource-template-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-project-resources-row {
          grid-template-columns: minmax(0, 1fr) minmax(156px, 0.54fr) 28px;
        }

        .playground-project-resources-row.has-source-column {
          grid-template-columns: minmax(0, 1fr) minmax(150px, 0.54fr) 28px;
        }

        .playground-project-resources-row.has-source-column.has-owner-column {
          grid-template-columns: minmax(0, 1fr) minmax(150px, 0.54fr) minmax(116px, 0.42fr) 28px;
        }

        .playground-team-resources-panel .playground-project-resources-row.has-source-column {
          grid-template-columns: minmax(0, 1fr) 196px 28px;
          column-gap: 18px;
        }

        .playground-team-resources-panel .playground-project-resources-row.has-source-column.has-owner-column {
          grid-template-columns: minmax(0, 1fr) 196px 132px 28px;
          column-gap: 16px;
        }

        .playground-project-resources-row > :nth-child(3) {
          display: none;
        }

        .playground-project-resources-row.has-source-column > :nth-child(2),
        .playground-project-resources-row.has-source-column > :nth-child(4) {
          display: none;
        }

        .playground-project-resources-row.has-source-column > :nth-child(3) {
          display: block;
        }

        .playground-project-resources-row.has-source-column.has-owner-column > :nth-child(5) {
          display: block;
        }
      }

      @media (max-width: 760px) {
        .playground-project-resources-toolbar {
          gap: 14px;
        }

        .playground-project-resources-toolbar .playground-files-library-search {
          flex-basis: 220px;
        }

        .playground-project-resources-row {
          grid-template-columns: minmax(0, 1fr) 28px;
        }

        .playground-project-resources-row > :nth-child(2),
        .playground-project-resources-row > :nth-child(3),
        .playground-project-resources-row > :nth-child(4) {
          display: none;
        }

        .playground-project-resources-row.has-owner-column > :nth-child(5) {
          display: none;
        }
      }

      .playground-project-overview-threads-section > .playground-plugins-section-header {
        margin-top: 0;
        padding-bottom: 0 !important;
        border-bottom: 0 !important;
      }

      .playground-project-overview-general-grid .playground-project-overview-threads-section > .playground-plugins-section-header {
        margin-bottom: 12px;
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

      .playground-project-overview-strategy-brief {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-project-overview-strategy-card {
        width: 100%;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.04);
        -webkit-backdrop-filter: blur(24px);
        backdrop-filter: blur(24px);
      }

      .playground-project-overview-strategy-card.is-notes {
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-project-overview-strategy-card.is-notes.is-full-strategy-notes {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-project-overview-strategy-goal {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-project-overview-strategy-goal-text {
        margin: 0;
        color: rgba(255, 255, 255, 0.72);
        font-size: 13px;
        line-height: 1.6;
        font-weight: 400;
      }

      .playground-project-overview-strategy-goal-text.is-empty {
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-project-overview-strategy-add-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: -2px;
      }

      .playground-project-overview-strategy-add-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 14px;
        line-height: 1.3;
        font-weight: 500;
      }

      .playground-project-overview-add-outcome-button.playground-files-control-button {
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-project-overview-add-outcome-button.playground-files-control-button:hover,
      .playground-project-overview-add-outcome-button.playground-files-control-button:active,
      .playground-project-overview-add-outcome-button.playground-files-control-button:focus-visible {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }

      .playground-project-overview-strategy-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .playground-project-overview-strategy-card-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 14px;
        line-height: 1.3;
        font-weight: 500;
      }

      .playground-project-overview-strategy-card-copy {
        margin: 0;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
      }

      .playground-project-overview-strategy-progress-card.playground-project-overview-progress-combo-card {
        min-height: 0;
      }

      .playground-project-overview-strategy-progress-card .playground-project-overview-progress-combo-chart {
        flex: 0 0 auto;
      }

      .playground-project-overview-outcome-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: calc((64px * 4) + (8px * 3));
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-width: thin;
      }

      .playground-project-overview-outcome-preview {
        display: block;
      }

      .playground-project-overview-outcome-progress-ring {
        position: relative;
        display: inline-flex;
        width: 24px;
        height: 24px;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        color: var(--permission-mini-ring-icon-color, rgba(255, 255, 255, 0.72));
        border: 0;
        border-radius: 999px;
        background: transparent;
        overflow: visible;
      }

      .playground-project-overview-outcome-progress-ring-canvas {
        position: absolute;
        inset: 0;
        z-index: 1;
        display: block;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none;
      }

      .playground-project-overview-outcome-progress-ring svg {
        position: relative;
        z-index: 2;
        width: 10px;
        height: 10px;
      }

      .playground-project-overview-outcome-preview .playground-tasks-backlog-item-content {
        width: 100%;
      }

      .playground-project-overview-outcome-preview .playground-tasks-backlog-main {
        margin-left: 2px;
      }

      .playground-project-overview-outcome-editor-modal {
        max-width: min(720px, calc(100vw - 32px));
      }

      .playground-project-overview-rule-editor-modal {
        width: min(520px, calc(100vw - 32px));
        max-width: min(520px, calc(100vw - 32px));
      }

      .playground-project-overview-rule-description-editor {
        margin-top: 0;
        padding-top: 0;
      }

      .playground-project-overview-rule-editor-modal .playground-tasks-project-modal-actions {
        margin-top: 16px;
      }

      .playground-project-overview-outcome-delete-button {
        margin-right: auto;
      }

      .playground-project-overview-outcome-editor-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-project-overview-rule-modal-textarea {
        min-height: 112px;
      }

      .playground-project-overview-outcome-ticket-list {
        max-height: 260px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-project-overview-outcome-ticket-row {
        width: 100%;
        min-width: 0;
        min-height: 36px;
        display: grid;
        grid-template-columns: 16px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 0 8px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-outcome-ticket-row:hover,
      .playground-project-overview-outcome-ticket-row.is-selected {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-project-overview-outcome-ticket-check {
        width: 14px;
        height: 14px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.32);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-project-overview-outcome-ticket-row.is-selected .playground-project-overview-outcome-ticket-check {
        color: #000;
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-outcome-ticket-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-project-overview-outcome-ticket-status {
        color: rgba(255, 255, 255, 0.44);
        font-size: 11px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-project-overview-outcome-card {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
        gap: 14px;
        padding: 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .playground-project-overview-outcome-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-project-overview-outcome-side {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-project-overview-outcome-progress {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-project-overview-outcome-progress-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 11px;
        line-height: 1.3;
        font-weight: 400;
      }

      .playground-project-overview-outcome-progress-track {
        height: 7px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-project-overview-outcome-progress-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #8bc4ff, #6c4dff);
      }

      .playground-project-overview-outcome-task-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .playground-project-overview-outcome-task-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 24px;
        color: rgba(255, 255, 255, 0.64);
        font-size: 11px;
        line-height: 1.3;
      }

      .playground-project-overview-outcome-task-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-overview-outcome-task-status {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-project-overview-strategy-notes {
        margin-top: 0;
        padding-top: 0;
      }

      .playground-project-overview-strategy-notes.playground-tasks-detail-description:not(.playground-agents-detail-instructions-section) {
        background: transparent;
        border: 0;
        padding: 0;
        padding-left: 0;
        padding-right: 0;
        padding-bottom: 0;
        border-radius: 0;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      @media (max-width: 760px) {
        .playground-project-overview-outcome-card {
          grid-template-columns: 1fr;
        }
      }

      .playground-project-overview-strategy-tab,
      .playground-project-overview-rules-tab {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-height: 0;
      }

      .playground-project-overview-rules-tab {
        position: relative;
        min-height: 0;
        padding-bottom: 0;
      }

      .playground-project-overview-rules-tab.is-inline {
        gap: 12px;
      }

      .playground-project-overview-strategy-tab .playground-tasks-detail-scroll,
      .playground-environments-page:not(.playground-agents-page) .playground-project-overview-strategy-tab .playground-project-overview-strategy-scroll,
      .playground-environments-page:not(.playground-agents-page) .playground-project-overview-rules-tab .playground-project-overview-rules-scroll {
        padding: 0;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-project-overview-strategy-tab .playground-tasks-detail-facts,
      .playground-project-overview-strategy-tab .playground-tasks-detail-description,
      .playground-project-overview-strategy-tab .playground-tasks-comments,
      .playground-project-overview-strategy-tab .playground-tasks-comment-dock {
        width: 100%;
        box-sizing: border-box;
        margin-left: 0;
        margin-right: 0;
      }

      .playground-project-overview-strategy-tab .playground-tasks-comment-dock {
        padding: 0;
        background: transparent;
      }

      .playground-project-overview-strategy-tab .playground-tasks-detail-description,
      .playground-project-overview-strategy-tab .playground-tasks-comments {
        margin-top: 0;
      }

      .playground-project-overview-strategy-tab .playground-tasks-empty {
        border-radius: 10px;
      }

      .playground-project-overview-strategy-tab .playground-project-overview-progress-combo-card {
        padding: 18px;
      }

      .playground-project-overview-rules-list {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow: auto;
        scrollbar-width: none;
      }

      .playground-project-overview-rules-list::-webkit-scrollbar {
        display: none;
      }

      .playground-project-overview-rules-empty {
        min-height: 360px;
        border-radius: 24px;
        background: transparent !important;
      }

      .playground-project-overview-rules-tab .playground-tasks-empty.playground-project-overview-rules-empty {
        background: transparent !important;
      }

      .playground-project-overview-rules-empty .playground-tasks-empty-title {
        font-weight: 500;
      }

      .playground-project-overview-rule-item {
        cursor: default;
      }

      .playground-project-overview-rule-item:hover {
        background: var(--playground-task-color-surface, rgba(255, 255, 255, 0.05));
        border-color: rgba(255, 255, 255, 0.05);
      }

      .playground-project-overview-rule-item .playground-tasks-backlog-leading {
        flex: 0 0 auto;
      }

      .playground-project-overview-rule-item .playground-tasks-backlog-item-content {
        align-items: center;
      }

      .playground-project-overview-rule-main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }

      .playground-project-overview-rule-copy {
        flex: 1 1 auto;
        min-width: 0;
        color: rgba(255, 255, 255, 0.78);
        font-size: 13px;
        line-height: 1.55;
        font-weight: 400;
        cursor: text;
      }

      .playground-project-overview-rule-copy.is-read-only {
        cursor: default;
      }

      .playground-project-overview-rule-copy.tb-runner-chat {
        display: block;
        height: auto;
        min-height: 0;
        flex: 1 1 auto;
        overflow: visible;
        background: transparent;
        font-family: inherit;
      }

      .playground-project-overview-rule-copy.tb-runner-chat .tb-message-markdown {
        margin: 0 !important;
        margin-bottom: 0 !important;
        color: inherit;
        font-size: inherit;
        line-height: inherit;
        font-weight: inherit;
      }

      .playground-project-overview-rule-copy.tb-runner-chat p {
        margin: 0 !important;
      }

      .playground-project-overview-rule-copy.tb-runner-chat .tb-message-markdown-paragraph,
      .playground-project-overview-rule-copy.tb-runner-chat .tb-message-markdown-list,
      .playground-project-overview-rule-copy.tb-runner-chat .tb-message-markdown-heading {
        margin: 0 !important;
      }

      .playground-project-overview-rule-edit-input {
        width: 100%;
        min-width: 0;
        min-height: 24px;
        max-height: 160px;
        padding: 0;
        border: 0;
        outline: none;
        resize: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        font: inherit;
        line-height: 1.55;
      }

      .playground-project-overview-rule-edit-input::placeholder {
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-project-overview-rule-remove {
        width: 28px;
        height: 28px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.42);
        cursor: pointer;
        transition: color 160ms ease, background-color 160ms ease, opacity 160ms ease;
      }

      .playground-project-overview-rule-remove:hover:not(:disabled) {
        color: rgba(255, 255, 255, 0.86);
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-project-overview-rule-remove:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .playground-project-overview-rules-composer-shell {
        position: fixed;
        left: calc(var(--playground-shell-sidebar-width, 0px) + ((100vw - var(--playground-shell-sidebar-width, 0px)) / 2));
        right: auto;
        bottom: 15px;
        width: min(56rem, calc(100vw - var(--playground-shell-sidebar-width, 0px) - 100px));
        margin: 0;
        transform: translateX(-50%);
        z-index: 50;
      }

      .playground-project-overview-rules-composer-shell.is-inline {
        position: relative;
        left: auto;
        right: auto;
        bottom: auto;
        width: 100%;
        transform: none;
        z-index: auto;
      }

      .playground-project-overview-rules-tab.is-inline .playground-project-overview-rules-list {
        flex: 0 1 auto;
        overflow: visible;
      }

      .playground-project-overview-rules-tab.is-inline .playground-project-overview-rules-empty {
        min-height: 180px;
      }

      .playground-project-overview-rules-runner.tb-runner-chat {
        height: auto;
        min-height: 0;
        display: block;
        flex: 0 0 auto;
        overflow: visible;
        background: transparent;
      }

      .playground-project-overview-rules-runner.tb-runner-chat .task-input-box {
        --tb-task-input-overlay: transparent;
        --tb-task-input-base-bg: transparent;
        display: flex !important;
        align-items: center !important;
        min-height: 52px !important;
        background: transparent !important;
      }

      .playground-project-overview-rules-runner.tb-runner-chat .task-input-box::before {
        background: var(--tb-task-input-border);
      }

      .playground-project-overview-rules-runner.tb-runner-chat .sidebar-textarea {
        height: 20px;
        min-height: 20px !important;
        max-height: 96px;
        padding: 0 0 0 30px !important;
        line-height: 20px !important;
        overflow: hidden;
      }

      .playground-project-overview-rules-runner.tb-runner-chat .task-input-controls {
        flex: 0 0 auto;
        align-self: center !important;
        align-items: center !important;
        padding: 0 10px 0 8px !important;
      }

      .playground-project-overview-rules-runner.tb-runner-chat .task-input-controls-full {
        flex-wrap: nowrap !important;
      }

      .playground-project-overview-rules-runner.tb-runner-chat .tb-composer-textarea-shell {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
      }

      .playground-project-overview-rules-runner.tb-runner-chat .task-input-spacer {
        display: none;
      }

      .playground-project-overview-rules-copy {
        margin: 0;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.6;
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
