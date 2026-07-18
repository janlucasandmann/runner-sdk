export const METRONOME_RUNS_CSS = String.raw`
      .playground-metronome-runs-view {
        box-sizing: border-box;
        width: min(100%, calc(var(--playground-centered-page-max-width) + 88px));
        max-width: calc(var(--playground-centered-page-max-width) + 88px);
        height: 100%;
        min-height: 0;
        margin: 0 auto;
        padding: 42px 44px 22px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        overflow: hidden;
        background: #000;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-run-thread-view {
        gap: 0;
        overflow: hidden;
      }

      .playground-metronome-run-thread-header {
        flex: 0 0 auto;
        padding: 0 0 24px;
        display: flex;
        align-items: flex-start;
        gap: 18px;
      }

      .playground-metronome-run-thread-back {
        flex: 0 0 auto;
        height: 28px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        padding: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font: inherit;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
      }

      .playground-metronome-run-thread-back:hover,
      .playground-metronome-run-thread-back:focus-visible {
        color: rgba(255, 255, 255, 0.92);
        outline: none;
      }

      .playground-metronome-run-thread-heading {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-metronome-run-thread-title-row {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-run-thread-page-title {
        margin: 0;
        min-width: 0;
        font-size: 18px;
        line-height: 1.2;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-run-thread-page-meta {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.25;
      }

      .playground-metronome-run-thread-body {
        flex: 1 1 0;
        min-height: 0;
        overflow-y: auto;
        padding: 0 0 32px;
      }

      .playground-metronome-run-thread-empty {
        flex: 1 1 0;
        min-height: 260px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.56);
        font-size: 13px;
      }

      .playground-metronome-runs-layout {
        flex: 0 0 auto;
        min-height: 0;
        display: flex;
        width: 100%;
      }

      .playground-metronome-runs-table-shell {
        flex: 1 1 0;
        min-height: 0;
        width: 100%;
        overflow: auto;
      }

      .playground-metronome-runs-table-section.playground-team-grid-table-section {
        flex: 0 0 auto;
        min-height: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        height: auto;
        width: 100%;
        align-self: stretch;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-metronome-runs-table-section .playground-project-overview-threads-table,
      .playground-metronome-runs-table-section .playground-project-overview-thread-list {
        flex: 0 0 auto;
        height: auto;
        min-height: 0;
        width: 100%;
      }

      .playground-metronome-runs-table-section .playground-agents-overview-sticky-table-header {
        flex: 0 0 auto;
      }

      .playground-metronome-runs-table-section .playground-metronome-runs-sticky-table-header {
        background: #121212;
      }

      .playground-metronome-runs-table-section .playground-project-overview-thread-list {
        width: calc(100% + 24px);
        margin-left: -12px;
        margin-right: -12px;
        overflow-y: visible !important;
      }

      .playground-metronome-runs-table-section .playground-project-overview-threads-table-header,
      .playground-metronome-runs-table-section .playground-project-overview-threads-table-row {
        grid-template-columns: 21px minmax(300px, 1.28fr) minmax(140px, 0.48fr) minmax(82px, 0.24fr) minmax(92px, 0.28fr) minmax(112px, 0.34fr) 28px !important;
        gap: 12px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        padding-right: 0;
      }

      .playground-metronome-runs-table-section .playground-project-overview-threads-table-header *,
      .playground-metronome-runs-table-section .playground-project-overview-threads-table-row * {
        font-size: 12px;
      }

      .playground-metronome-runs-table-section .playground-project-overview-threads-table-header.playground-metronome-runs-column-header {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-runs-table-section .playground-project-overview-threads-table-header.playground-metronome-runs-column-header > div:first-child {
        justify-self: center;
        justify-content: center;
        text-align: center;
      }

      .playground-metronome-runs-table-section .playground-project-overview-threads-table-header.playground-metronome-runs-column-header > div:nth-child(2) {
        justify-self: stretch;
        justify-content: flex-start;
        text-align: left;
      }

      .playground-metronome-runs-table-section .playground-project-overview-thread-cell.is-select {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-runs-table-section .playground-project-overview-thread-cell,
      .playground-metronome-runs-table-section .playground-metronome-table-title,
      .playground-metronome-runs-table-section .playground-metronome-table-subtitle,
      .playground-metronome-runs-table-section .playground-agents-overview-table-value {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-runs-table-section .playground-project-overview-thread-cell.is-actions,
      .playground-metronome-runs-table-section .playground-project-overview-threads-table-header > div:last-child {
        justify-self: end;
      }

      .playground-metronome-runs-table-section .playground-project-overview-thread-cell.is-actions {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-metronome-run-action-menu-shell {
        position: relative;
      }

      .playground-metronome-run-action-menu-shell .playground-metronome-run-table-action-menu {
        left: auto;
        right: 0;
        min-width: 168px;
        z-index: 2147483003;
        transform-origin: top right;
      }

      .playground-metronome-run-table-action-menu.is-context {
        position: fixed;
        right: auto;
        z-index: 2147483003;
        min-width: 168px;
        transform-origin: top left;
      }

      .playground-metronome-run-table-action-menu.is-context.playground-tasks-toolbar-popup-menu-animate-down-in {
        animation: playground-tasks-toolbar-popup-fade-down-in 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .playground-metronome-runs-table-section .playground-metronome-runs-table-state {
        min-height: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 28px 18px;
        color: rgba(255, 255, 255, 0.56);
        text-align: center;
      }

      .playground-metronome-runs-table .playground-metronome-runs-col-main {
        width: 42%;
      }

      .playground-metronome-runs-table .playground-metronome-runs-col-started {
        width: 18%;
      }

      .playground-metronome-runs-table .playground-metronome-runs-col-steps,
      .playground-metronome-runs-table .playground-metronome-runs-col-threads {
        width: 12%;
      }

      .playground-metronome-runs-table .playground-metronome-runs-col-status {
        width: 12%;
      }

      .playground-metronome-runs-list,
      .playground-metronome-run-detail {
        position: relative;
        min-height: 0;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        overflow: hidden;
      }

      .playground-metronome-runs-list::before,
      .playground-metronome-run-detail::before,
      .playground-metronome-run-sidebar-submit::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border, linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.06)));
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-metronome-runs-list {
        width: 100%;
        overflow-y: auto;
      }

      .playground-metronome-run-row {
        width: 100%;
        min-height: 74px;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        padding: 14px 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        cursor: pointer;
      }

      .playground-metronome-run-row:hover,
      .playground-metronome-run-row.is-active {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-metronome-run-row-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .playground-metronome-run-row-title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-metronome-run-row-meta {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.2;
      }

      .playground-metronome-run-sidebar-menu-trigger::before {
        content: none !important;
        display: none !important;
      }

      .playground-metronome-run-detail {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .playground-metronome-run-detail-header {
        flex: 0 0 auto;
        padding: 18px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-metronome-run-detail-title {
        font-size: 16px;
        line-height: 1.2;
        font-weight: 600;
      }

      .playground-metronome-run-detail-copy {
        margin-top: 7px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-run-detail-body {
        flex: 1 1 0;
        min-height: 0;
        overflow-y: auto;
        padding: 18px 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .playground-metronome-run-section-title {
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 13px;
        font-weight: 600;
      }

      .playground-metronome-run-steps {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .playground-metronome-run-step {
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.22);
        padding: 12px;
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr);
        gap: 11px;
      }

      .playground-metronome-run-step-index {
        width: 28px;
        height: 28px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 166, 255, 0.14);
        color: #66a6ff;
        font-size: 12px;
        font-weight: 700;
      }

      .playground-metronome-run-step-title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.25;
      }

      .playground-metronome-run-step-summary {
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-run-step-branch {
        margin-top: 9px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.25;
      }

      .playground-metronome-run-step-branch-chip {
        min-width: 0;
        max-width: 100%;
        border-radius: 999px;
        padding: 4px 8px;
        background: rgba(102, 166, 255, 0.13);
        color: #9fc6ff;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-metronome-run-step-branch-reason {
        flex-basis: 100%;
        color: rgba(255, 255, 255, 0.42);
        font-size: 11px;
        line-height: 1.35;
      }

      .playground-metronome-run-thread-list,
      .playground-metronome-run-log-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-metronome-run-thread-list.is-work-log-surface {
        width: 100%;
        min-height: auto;
        height: auto;
        box-sizing: border-box;
        gap: 0;
        background: transparent;
        flex: 0 0 auto;
        overflow: visible;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-turn {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-user-shell {
        align-self: flex-end;
        max-width: min(760px, 72%);
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-work-header {
        margin-top: 34px;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-work {
        margin-top: 8px;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-work .agent-steps-container {
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-log-step {
        width: 100%;
        max-width: 980px;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-summary {
        margin-top: 36px;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-output-markdown {
        margin-top: 8px;
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-meta-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-title-line .playground-metronome-run-thread-meta-row {
        margin-top: 0;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-title-line {
        display: flex;
        align-items: baseline;
        gap: 10px;
        min-width: 0;
      }

      .playground-metronome-run-thread-list.is-work-log-surface .playground-metronome-run-thread-title-text {
        flex: 1 1 auto;
      }

      .playground-metronome-run-thread,
      .playground-metronome-run-log {
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.2);
        padding: 12px;
      }

      .playground-metronome-run-thread-title,
      .playground-metronome-run-log-message {
        font-size: 12px;
        font-weight: 600;
        line-height: 1.35;
      }

      .playground-metronome-run-thread-meta,
      .playground-metronome-run-log-meta {
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.3;
      }

      .playground-metronome-runs-empty {
        height: 100%;
        min-height: 260px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 32px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 13px;
        line-height: 1.45;
      }

      .playground-metronome-run-sidebar {
        position: relative;
        z-index: 1;
        width: 100%;
        min-height: 0;
        height: 100%;
        background: transparent;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .playground-metronome-run-sidebar-header {
        flex: 0 0 auto;
        min-height: 56px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-metronome-run-sidebar-title {
        font-size: 13px;
        font-weight: 500;
        line-height: 1.2;
        padding-left: 5px;
      }

      .playground-metronome-run-sidebar-actions {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        min-width: 0;
      }

      .playground-metronome-run-sidebar-new-run {
        --playground-top-nav-private-chat-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        height: 30px;
        min-height: 30px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        padding: 0 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        cursor: pointer;
        transition: background 160ms ease, color 160ms ease;
      }

      .playground-metronome-run-sidebar-new-run::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-top-nav-private-chat-border, linear-gradient(-10deg, rgba(200,200,200,0.25), rgba(255,255,255,0.1), rgba(255,255,255,0.15), rgba(255,255,255,0.375)));
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-metronome-run-sidebar-new-run:hover,
      .playground-metronome-run-sidebar-new-run:focus-visible,
      .playground-metronome-run-sidebar-menu-trigger:hover,
      .playground-metronome-run-sidebar-menu-trigger:focus-visible {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.98);
        outline: none;
      }

      .playground-metronome-run-sidebar-divider {
        flex: 0 0 1px;
        width: 1px;
        height: 22px;
        margin: 0 2px;
        background: rgba(255, 255, 255, 0.15);
      }

      .playground-metronome-run-sidebar-menu-shell {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .playground-metronome-run-sidebar-menu-trigger {
        --playground-top-nav-private-chat-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        width: 30px;
        height: 30px;
        min-width: 30px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-run-sidebar-menu {
        position: absolute;
        z-index: 2200;
        top: calc(100% + 8px);
        right: 0;
        width: 282px;
        min-width: 282px;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0 !important;
        padding: 0 !important;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: #323232 !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35) !important;
        backdrop-filter: blur(10px);
      }

      .playground-metronome-run-sidebar-menu .tb-popup-row {
        width: 100% !important;
        min-height: 40px;
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 12px !important;
        padding: 10px 14px !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        color: white !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        line-height: 1.2 !important;
        text-align: left !important;
      }

      .playground-metronome-run-sidebar-menu button.tb-popup-row {
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-metronome-run-sidebar-menu button.tb-popup-row:hover,
      .playground-metronome-run-sidebar-menu button.tb-popup-row:focus-visible {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #fff !important;
        outline: none;
      }

      .playground-metronome-run-sidebar-menu .playground-thread-nav-popup-static-row {
        cursor: default !important;
        user-select: text;
      }

      .playground-metronome-run-sidebar-menu .playground-thread-nav-popup-static-row:hover {
        background: transparent !important;
      }

      .playground-metronome-run-sidebar-menu .tb-popup-icon {
        width: 14px !important;
        height: 14px !important;
        flex: 0 0 auto;
        color: currentColor !important;
      }

      .playground-metronome-run-sidebar-menu .tb-popup-row.is-danger {
        color: rgba(255, 118, 118, 0.96) !important;
      }

      .playground-metronome-run-sidebar-menu .tb-popup-row.is-danger:hover,
      .playground-metronome-run-sidebar-menu .tb-popup-row.is-danger:focus-visible {
        background: rgba(255, 80, 80, 0.12) !important;
        color: rgba(255, 142, 142, 0.98) !important;
      }

      .playground-metronome-run-sidebar-body {
        flex: 1 1 0;
        min-height: 0;
        overflow-y: auto;
        padding: 8px 10px 132px 15px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-metronome-run-sidebar-copy {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-run-sidebar-log {
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        padding: 11px 12px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-run-sidebar-log.is-error {
        color: #ffb4b4;
        background: rgba(255, 88, 88, 0.08);
      }

      .playground-metronome-run-empty-state {
        flex: 1 1 auto;
        min-height: 260px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .playground-metronome-run-empty-card {
        width: min(100%, 310px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .playground-metronome-run-empty-image {
        width: 160px;
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 0 16px;
        object-fit: contain;
      }

      .playground-metronome-run-empty-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-metronome-run-empty-copy {
        margin: 7px 0 0;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-run-user-row {
        display: flex;
        justify-content: flex-end;
      }

      .playground-metronome-run-user-bubble {
        max-width: 78%;
        border-radius: 18px 18px 5px 18px;
        padding: 9px 15px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        line-height: 1.35;
        overflow-wrap: anywhere;
      }

      .playground-metronome-run-email-bubble {
        display: flex;
        flex-direction: column;
        gap: 5px;
        text-align: left;
      }

      .playground-metronome-run-email-from {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        line-height: 1.25;
      }

      .playground-metronome-run-email-subject {
        color: rgba(255, 255, 255, 0.88);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.3;
      }

      .playground-metronome-run-email-body {
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        line-height: 1.4;
        white-space: pre-wrap;
      }

      .playground-metronome-run-trace {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-metronome-run-trace-step {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .playground-metronome-run-trace-heading {
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        align-items: flex-start;
        gap: 8px;
      }

      .playground-metronome-run-trace-icon {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-metronome-run-trace-title-group {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-metronome-run-trace-title {
        min-width: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-run-thread-link {
        width: fit-content;
        max-width: 100%;
        border: 0;
        padding: 0;
        background: transparent;
        color: #66a6ff;
        font: inherit;
        font-size: 10px;
        line-height: 1.2;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-run-thread-link:hover {
        text-decoration: underline;
      }

      .playground-metronome-run-thread-meta-row {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        min-width: 0;
      }

      .playground-metronome-run-thread-id {
        min-width: 0;
        max-width: 170px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 10px;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-run-trace-status {
        color: rgba(255, 255, 255, 0.45);
        font-size: 10px;
        line-height: 1.2;
        text-transform: capitalize;
      }

      .playground-metronome-run-trace-summary {
        margin-left: 26px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }

      .playground-metronome-run-trace-field {
        margin-left: 26px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .playground-metronome-run-trace-field-label {
        color: rgba(255, 255, 255, 0.46);
        font-size: 10px;
        font-weight: 500;
        line-height: 1.2;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .playground-metronome-run-branch-result {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-run-branch-chip {
        max-width: 100%;
        border-radius: 999px;
        padding: 4px 9px;
        background: rgba(77, 163, 255, 0.13);
        color: #8ec5ff;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-run-branch-reason {
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-run-trace-summary-step {
        padding-top: 4px;
      }

      .playground-metronome-run-output-block {
        margin: 3px 0 0 26px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.18);
        padding: 12px 14px;
        color: rgba(255, 255, 255, 0.84);
        font-family: var(--font-mono, "SFMono-Regular", Consolas, "Liberation Mono", monospace);
        font-size: 11px;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow: auto;
      }

      .playground-metronome-run-output-markdown {
        margin: 3px 0 0 26px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }

      .playground-metronome-run-output-markdown-scope {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-run-output-markdown.tb-message-markdown,
      .playground-metronome-run-output-markdown .tb-message-markdown,
      .playground-metronome-run-output-markdown .tb-message-markdown-paragraph,
      .playground-metronome-run-output-markdown .tb-message-markdown-list,
      .playground-metronome-run-output-markdown .tb-message-markdown-heading,
      .playground-metronome-run-output-markdown .tb-message-markdown-strong,
      .playground-metronome-run-output-markdown .tb-message-markdown-em,
      .playground-metronome-run-output-markdown .tb-message-markdown-inline-code,
      .playground-metronome-run-output-markdown .tb-message-markdown-link {
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-run-output-markdown .tb-message-markdown-paragraph,
      .playground-metronome-run-output-markdown .tb-message-markdown-list,
      .playground-metronome-run-output-markdown .tb-message-markdown-heading {
        margin: 0;
      }

      .playground-metronome-run-output-markdown .tb-message-markdown-paragraph + .tb-message-markdown-paragraph,
      .playground-metronome-run-output-markdown .tb-message-markdown-paragraph + .tb-message-markdown-list,
      .playground-metronome-run-output-markdown .tb-message-markdown-list + .tb-message-markdown-paragraph {
        margin-top: 6px;
      }

      .playground-metronome-run-running-row {
        border-radius: 12px;
        background: rgba(102, 166, 255, 0.08);
        color: rgba(255, 255, 255, 0.74);
        padding: 10px 12px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        line-height: 1.3;
      }

      .playground-metronome-run-sidebar-composer {
        position: absolute;
        left: 15px;
        right: 10px;
        bottom: 15px;
        z-index: 8;
        width: auto;
        min-width: 0;
        max-width: none;
        box-sizing: border-box;
        border-radius: 18px;
        background: transparent;
        display: block;
        padding: 0;
        overflow: visible;
      }

      .playground-metronome-run-sidebar-composer > .tb-runner-chat.playground-metronome-run-sidebar-runner-chat {
        position: relative;
        width: 100%;
        min-width: 0 !important;
        max-width: none !important;
        height: auto;
        min-height: 0;
        display: block;
        grid-template-rows: none;
        flex: none;
        overflow: visible;
        background: transparent;
      }

      .playground-metronome-run-sidebar-runner-chat .tb-input-width {
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }

      .playground-metronome-run-sidebar-runner-chat > :not(.tb-input-shell) {
        display: none !important;
      }

      .playground-metronome-run-sidebar-runner-chat .tb-input-shell {
        position: relative !important;
        left: auto !important;
        right: auto !important;
        bottom: auto !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        min-height: 0;
        padding: 0 !important;
        margin: 0 !important;
        display: block !important;
        justify-content: stretch !important;
        background: transparent !important;
      }

      .playground-metronome-run-sidebar-runner-chat .tb-input-shell > *,
      .playground-metronome-run-sidebar-runner-chat .tb-composer-textarea-shell {
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        box-sizing: border-box !important;
      }

      .playground-metronome-run-sidebar-runner-chat .task-input-box {
        --tb-task-input-base-bg: rgba(0, 0, 0, 0.94);
        --tb-task-input-overlay: transparent;
        width: 100%;
        min-width: 0 !important;
        max-width: none;
        box-sizing: border-box !important;
      }

      .playground-metronome-run-sidebar-runner-chat .sidebar-textarea {
        min-height: 46px;
        padding-top: 14px;
      }

      .playground-metronome-run-sidebar-textarea {
        flex: 1 1 auto;
        min-width: 0;
        width: 100%;
        height: 48px;
        border: 0;
        outline: 0;
        resize: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        font-size: 13px;
        line-height: 1.35;
      }

      .playground-metronome-run-sidebar-textarea::placeholder {
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-metronome-run-sidebar-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-metronome-run-sidebar-control-button,
      .playground-metronome-run-sidebar-submit {
        position: relative;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 999px;
        background: #fff;
        color: #050505;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-run-sidebar-control-button {
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-metronome-run-sidebar-submit:disabled {
        opacity: 0.52;
        cursor: default;
      }

      .playground-metronome-run-sidebar-select-shell {
        min-width: 0;
        max-width: 148px;
        height: 34px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.82);
        font-size: 12px;
        line-height: 1;
      }

      .playground-metronome-run-sidebar-select-shell.is-computer {
        margin-left: auto;
      }

      .playground-metronome-run-sidebar-select-shell select {
        min-width: 0;
        max-width: 118px;
        border: 0;
        outline: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        font: inherit;
        font-size: 12px;
        line-height: 1;
        appearance: none;
        cursor: pointer;
      }

      .playground-metronome-run-sidebar-select-shell option {
        background: #111;
        color: #fff;
      }

      .playground-metronome-top-nav-menu-shell {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .playground-top-nav-private-chat-button.playground-metronome-top-nav-menu-trigger {
        width: 30px;
        min-width: 30px;
        padding: 0;
      }

      .playground-top-nav-private-chat-button.playground-metronome-top-nav-menu-trigger::before {
        display: none !important;
        content: none !important;
      }

      .playground-metronome-top-nav-menu {
        --playground-top-nav-popup-border: var(--tb-task-input-border, var(--tb-runner-input-border, linear-gradient(-10deg, rgba(200, 200, 200, 0.25), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.375))));
        position: absolute;
        z-index: 2200;
        top: calc(100% + 8px);
        right: 0;
        width: 230px;
        min-width: 230px;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0 !important;
        padding: 4px 0 !important;
        border-radius: 25px;
        overflow: hidden;
        border: 0 !important;
        background: rgba(30, 30, 30, 0.5) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35) !important;
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);
      }

      .playground-metronome-top-nav-menu::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-top-nav-popup-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-metronome-top-nav-menu-id {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.2;
      }

      .playground-metronome-top-nav-menu-id code {
        display: block;
        max-width: 100%;
        color: rgba(255, 255, 255, 0.85);
        font-family: var(--font-mono, "SFMono-Regular", Consolas, "Liberation Mono", monospace);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.35;
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .playground-metronome-top-nav-menu .tb-popup-row {
        width: 100% !important;
        min-height: 40px;
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 12px !important;
        padding: 10px 14px !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        color: white !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        line-height: 1.2 !important;
        text-align: left !important;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-metronome-top-nav-menu .tb-popup-row:hover,
      .playground-metronome-top-nav-menu .tb-popup-row:focus-visible {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #fff !important;
        outline: none;
      }

      .playground-metronome-top-nav-menu .tb-popup-row .tb-popup-icon {
        width: 14px !important;
        height: 14px !important;
        flex: 0 0 auto;
        color: currentColor !important;
      }

      .playground-metronome-top-nav-menu .tb-popup-row.is-danger {
        color: rgba(255, 118, 118, 0.96) !important;
      }

      .playground-metronome-top-nav-menu .tb-popup-row.is-danger:hover,
      .playground-metronome-top-nav-menu .tb-popup-row.is-danger:focus-visible {
        background: rgba(255, 80, 80, 0.12) !important;
        color: rgba(255, 142, 142, 0.98) !important;
      }
`;
