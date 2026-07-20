export const PROJECT_OVERVIEW_CSS_03_FRAGMENT = String.raw`        position: relative;
        overflow: visible;
        z-index: 70;
      }

      .playground-project-settings-root {
        gap: 42px;
      }

      .playground-project-settings-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
        position: relative;
        overflow: visible;
      }

      .playground-project-settings-wallpaper-section {
        width: 100%;
        max-width: none;
      }

      .playground-project-settings-wallpaper-section .playground-tasks-project-wallpaper-picker {
        margin-bottom: 0;
      }

      .playground-project-settings-wallpaper-section .playground-tasks-project-wallpaper-picker-preview {
        height: 260px;
      }

      .playground-project-settings-rules-section .playground-project-overview-rules-list {
        margin-top: 0;
      }

      .playground-project-settings-rules-section {
        margin-bottom: 0;
      }

      .playground-project-settings-rules-section .playground-project-overview-rules-empty .playground-tasks-empty-title {
        font-size: 12px;
      }

      .playground-project-settings-access-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
        position: relative;
        overflow: visible;
        margin-bottom: 42px;
      }

      .playground-project-settings-reduced-access {
        gap: 18px;
      }

      .playground-project-settings-reduced-access .playground-project-team-role-permission-page {
        width: 100%;
      }

      .playground-project-settings-reduced-access .playground-team-role-permission-title {
        font-size: 14px;
        line-height: 1.3;
      }

      .playground-project-settings-reduced-access .playground-agents-permission-select-shell::after {
        display: none;
        content: none;
      }

      .playground-project-settings-reduced-access .playground-agents-permission-select {
        padding-right: 0;
        cursor: default;
      }

      .playground-project-settings-source-button {
        flex: 0 0 auto;
        border: 0;
        background: transparent;
        padding: 0;
        color: rgba(255, 255, 255, 0.58);
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.2;
        cursor: pointer;
      }

      .playground-project-settings-source-button:hover {
        color: #fff;
      }

      .playground-project-teams-add-button,
      .playground-project-settings-add-rule-button {
        font-size: 12px;
      }

      .playground-project-team-permissions-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        min-width: 0;
      }

      .playground-project-team-permissions-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 30px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
      }

      .playground-project-team-permissions-back:hover {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-team-permissions-title {
        min-width: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.2;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-teams-table-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-width: 0;
      }

      .playground-project-teams-table-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.2;
      }

      .playground-project-teams-add-shell,
      .playground-project-team-action-shell {
        position: relative;
        display: inline-flex;
        justify-content: flex-end;
        z-index: 220;
      }

      .playground-project-team-action-shell.is-open {
        z-index: 360;
      }

      .playground-project-team-action-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        left: auto;
        min-width: 210px;
        width: max-content;
        max-width: min(280px, calc(100vw - 32px));
        padding: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        background: #323232;
        color: rgba(255, 255, 255, 0.94);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        overflow: hidden;
        z-index: 400;
        transform-origin: top right;
      }

      .playground-project-teams-add-menu {
        --platform-popup-padding: 6px;
        min-width: 210px;
        width: max-content;
        max-width: min(280px, calc(100vw - 32px));
        color: rgba(255, 255, 255, 0.94);
        overflow: hidden;
        transform-origin: top right;
      }

      .playground-project-team-action-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        cursor: pointer;
      }

      .playground-project-team-action-button:hover,
      .playground-project-team-action-shell.is-open .playground-project-team-action-button {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-project-team-menu-item {
        width: 100%;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        padding: 8px 10px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.2;
        text-align: left;
        cursor: pointer;
        white-space: nowrap;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-project-team-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .playground-project-team-menu-item svg {
        flex: 0 0 auto;
        color: currentColor;
      }

      .playground-project-team-menu-item.is-danger {
        color: rgba(255, 125, 145, 0.96);
      }

      .playground-project-team-menu-item.is-danger:hover {
        background: rgba(255, 125, 145, 0.12);
        color: rgba(255, 145, 162, 1);
      }

      .playground-project-team-menu-item:disabled {
        cursor: default;
        opacity: 0.55;
      }

      .playground-project-team-menu-item:disabled:hover {
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-project-teams-table-shell td.is-actions {
        position: relative;
        overflow: visible;
        z-index: 5;
      }

      .playground-auth-users-table-shell.playground-team-table-shell.playground-project-teams-table-shell {
        position: relative;
        background: transparent;
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
        z-index: 120;
        isolation: isolate;
      }

      .playground-auth-users-table-shell.playground-team-table-shell.playground-project-teams-table-shell::before {
        z-index: 0 !important;
        pointer-events: none;
      }

      .playground-auth-users-table-shell.playground-team-table-shell.playground-project-teams-table-shell > * {
        position: relative;
        z-index: 1 !important;
      }

      .playground-project-teams-table-shell table,
      .playground-project-teams-table-shell thead,
      .playground-project-teams-table-shell tbody,
      .playground-project-teams-table-shell tr,
      .playground-project-teams-table-shell td,
      .playground-project-teams-table-shell th {
        overflow: visible;
      }

      .playground-project-teams-table-shell tr.is-menu-open,
      .playground-project-teams-table-shell tr.is-menu-open td {
        position: relative;
        z-index: 320;
      }

      .playground-project-teams-table-shell tr:has(.playground-project-team-action-shell.is-open),
      .playground-project-teams-table-shell tr:has(.playground-project-team-action-shell.is-open) td,
      .playground-project-teams-table-shell td.is-actions:has(.playground-project-team-action-shell.is-open) {
        position: relative;
        z-index: 320;
      }

      .playground-project-teams-table-shell .playground-project-team-action-shell.is-open .playground-project-team-action-menu {
        z-index: 420;
      }

      .playground-project-overview-panel-plain.playground-plugins-section {
        gap: 14px;
        margin-top: 0;
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

      .playground-project-overview-files-section .playground-plugins-search-row {
        position: relative;
        z-index: 40;
      }

      .playground-project-overview-files-section .playground-plugins-toolbar-controls,
      .playground-project-overview-files-section .playground-tasks-toolbar-popup-shell {
        position: relative;
        z-index: 41;
      }

      .playground-project-overview-files-section .playground-tasks-toolbar-popup-shell .tb-popup-menu.playground-tasks-toolbar-popup-menu {
        z-index: 42;
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search-shell,
      .playground-project-overview-threads-section .playground-plugins-search-shell,
      .playground-project-overview-files-section .playground-plugins-search-shell {
        --playground-project-overview-search-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        flex: 0 1 360px;
        width: min(360px, 100%);
        min-width: 0;
        max-width: 360px;
        overflow: hidden;
        border-radius: 999px;
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search-shell,
      .playground-project-overview-threads-section .playground-plugins-search-shell {
        flex-basis: 260px;
        width: min(260px, 100%);
        max-width: 260px;
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search-shell::before,
      .playground-project-overview-threads-section .playground-plugins-search-shell::before,
      .playground-project-overview-files-section .playground-plugins-search-shell::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 2;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-search-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search,
      .playground-project-overview-threads-section .playground-plugins-search,
      .playground-project-overview-files-section .playground-plugins-search {
        position: relative;
        z-index: 1;
        height: 30px;
        min-height: 30px;
        border: 0;
        background: rgba(255, 255, 255, 0.05);
        font-size: 12px;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-current-tasks-section .playground-plugins-search-icon,
      .playground-project-overview-threads-section .playground-plugins-search-icon,
      .playground-project-overview-files-section .playground-plugins-search-icon {
        z-index: 3;
      }

      .playground-project-overview-threads-section .playground-plugins-search-shell {
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #000;
      }

      .playground-project-overview-threads-section .playground-plugins-search-shell::before {
        content: none;
        display: none;
      }

      .playground-project-overview-threads-section .playground-plugins-search {
        background: #000 !important;
      }

      .playground-project-overview-current-tasks-section .playground-files-control-button,
      .playground-project-overview-threads-section .playground-files-control-button,
      .playground-project-overview-files-section .playground-files-control-button {
        min-height: 32px;
      }

      .playground-project-overview-toolbar-action,
      .playground-project-overview-current-tasks-see-all {
        --playground-project-overview-action-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        margin-left: auto;
        position: relative;
        z-index: 0;
        overflow: hidden;
        border: 0;
      }

      .playground-project-overview-toolbar-action::before,
      .playground-project-overview-current-tasks-see-all::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-action-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-toolbar-action > *,
      .playground-project-overview-current-tasks-see-all > * {
        position: relative;
        z-index: 1;
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
        --playground-project-overview-files-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        margin-top: 12px;
        margin-bottom: 32px;
        padding: 20px 20px 22px;
        border: 0;
        border-radius: 15px;
        background: transparent;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-files-section::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-files-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-files-section > * {
        position: relative;
        z-index: 1;
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

      .playground-project-overview-files-overview {
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin-top: 12px;
        margin-bottom: 32px;
      }

      .playground-project-overview-files-kpi-card {
        --playground-project-overview-files-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        overflow: hidden;
        border: 0;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-files-kpi-card::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-files-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-files-kpi-card > * {
        position: relative;
        z-index: 1;
      }

      .playground-project-overview-files-kpi-card {
        padding: 22px 24px 20px;
      }

      .playground-project-overview-files-kpi-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-files-kpi-title {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
        font-size: 13px;
        line-height: 1.35;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-project-overview-files-kpi-title strong {
        color: rgba(255, 255, 255, 0.92);
        font-weight: 500;
      }

      .playground-project-overview-files-kpi-pill {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 26px;
        padding: 4px 12px;
        border-radius: 0;
        background: rgba(255, 255, 71, 0.12);
        color: rgb(250, 255, 83);
        font-size: 12px;
        line-height: 1;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-weight: 400;
      }

      .playground-project-overview-files-kpi-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 26px;
        padding-top: 28px;
      }

      .playground-project-overview-files-kpi-label {
        margin-bottom: 8px;
        font-size: 12px;
        line-height: 1.35;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-project-overview-files-kpi-value {
        font-size: clamp(42px, 6vw, 70px);
        line-height: 0.95;
        font-weight: 500;
        letter-spacing: 0;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-files-kpi-value.is-storage {
        text-align: left;
      }

      .playground-project-overview-files-storage {
        padding-top: 26px;
      }

      .playground-project-overview-files-storage-track {
        position: relative;
        height: 15px;
        overflow: hidden;
        background:
          repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.13) 0,
            rgba(255, 255, 255, 0.13) 7px,
            transparent 7px,
            transparent 15px
          );
      }

      .playground-project-overview-files-storage-fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: var(--project-file-storage-percent, 0%);
        min-width: 0;
        background: rgb(250, 255, 83);
        box-shadow: 0 0 22px rgba(250, 255, 83, 0.28);
      }

      .playground-project-overview-files-storage-labels {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0;
        margin-top: 15px;
        font-size: 12px;
        line-height: 1.35;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-project-overview-files-storage-labels span:nth-child(1) {
        text-align: left;
      }

      .playground-project-overview-files-storage-labels span {
        text-align: center;
      }

      .playground-project-overview-files-storage-labels span:last-child {
        text-align: right;
      }

      .playground-project-overview-files-connectors {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-top: 28px;
        padding-top: 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-files-connectors-group {
        min-width: 0;
      }

      .playground-project-overview-files-connectors-title {
        margin-bottom: 10px;
        font-size: 12px;
        line-height: 1.35;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-project-overview-files-connector-list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .playground-project-overview-files-connector-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-files-connector-pill img,
      .playground-project-overview-files-connector-pill svg {
        width: 16px;
        height: 16px;
      }

      .playground-project-overview-files-connector-empty {
        font-size: 12px;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-project-overview-files-card-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-project-overview-chart-card .playground-project-overview-files-card-grid {
        margin-top: 22px;
      }

      .playground-project-overview-files-nav-card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        min-height: 150px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: transparent;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition: border-color 160ms ease, transform 160ms ease;
      }

      .playground-project-overview-files-nav-card:hover {
        border-color: rgba(255, 255, 255, 0.16);
        transform: translateY(-1px);
      }

      .playground-project-overview-files-nav-card-icon {
        --playground-project-overview-control-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-project-overview-files-nav-card-icon::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-control-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-files-nav-card-icon > * {
        position: relative;
        z-index: 1;
      }

      .playground-project-overview-files-nav-card-title {
        margin-top: 18px;
        font-size: 13px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-project-overview-files-nav-card-copy {
        margin-top: 6px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-project-overview-files-subview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 16px;
      }

      .playground-project-overview-files-subview-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-project-overview-files-subview-back:hover {
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-files-subview-title {
        margin-top: 10px;
        font-size: 18px;
        line-height: 1.2;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-files-subview-copy {
        margin-top: 5px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-project-overview-imagine-empty {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        min-height: 180px;
        justify-content: center;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-project-overview-imagine-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 12px;
      }

      .playground-project-overview-imagine-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        min-height: 104px;
        padding: 14px;
        border: 0;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        color: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-imagine-card:hover {
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-project-overview-imagine-card-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-imagine-card-body {
        display: block;
        min-width: 0;
      }

      .playground-project-overview-imagine-card-title {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-project-overview-imagine-card-path,
      .playground-project-overview-imagine-card-meta {
        display: block;
        margin-top: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.5);
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
        position: relative;
        z-index: 1;
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

      .playground-project-overview-general-grid .playground-project-overview-threads-section {
        margin-bottom: 24px;
      }

      .playground-project-overview-threads-load-more {
        display: flex;
        justify-content: center;
        width: 100%;
        padding-top: 12px;
      }

      .playground-project-overview-threads-table {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
      }

      .playground-project-overview-threads-table-header,
      .playground-project-overview-threads-table-row {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(86px, 0.62fr) minmax(0, 1.08fr) minmax(0, 1.2fr) minmax(82px, 0.62fr) 28px;
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
      .playground-project-overview-thread-cell.is-task,
      .playground-project-overview-thread-cell.is-source,
      .playground-project-overview-thread-cell.is-environment,
      .playground-project-overview-thread-cell.is-triggered-by {
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.62);
        overflow: visible;
        text-overflow: clip;
      }

      .playground-project-overview-thread-cell.is-source {
        color: rgba(255, 255, 255, 0.74);
        white-space: nowrap;
      }

      .playground-project-overview-thread-cell.is-date {
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
        grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.45fr) minmax(92px, 0.8fr) minmax(112px, 0.8fr);
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

      .playground-project-overview-resource-cell.is-creator,
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

      .playground-project-overview-resources-home {
        display: flex;
        flex-direction: column;
        gap: 0;
        width: 100%;
      }

      .playground-project-resource-template-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-project-resource-template-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-project-resource-template-title {
        margin: 0;
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-resource-template-copy {
        margin: 4px 0 0;
        max-width: 640px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-project-resource-template-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-project-resource-template-card {
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.075);
        color: rgba(255, 255, 255, 0.96);
        padding: 14px;
        min-height: 154px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;
        font: inherit;
`;
