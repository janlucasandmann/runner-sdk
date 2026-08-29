export const METRONOME_RUNS_CSS = String.raw`
      .playground-metronome-settings-page {
        width: 100%;
        min-height: 0;
      }

      .playground-metronome-settings-content {
        min-width: 0;
      }

      .playground-metronome-settings-stack {
        display: grid;
        align-content: start;
        gap: 24px;
        min-width: 0;
        padding: 0;
      }

      .playground-metronome-settings-sidebar {
        padding-top: 0;
      }

      .playground-metronome-settings-trigger-button.platform-button {
        width: 100%;
        margin-top: 8px;
      }

      .playground-metronome-settings-budget-section {
        box-sizing: border-box;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-metronome-settings-budget-section .platform-settings-section__header {
        min-height: 0;
        padding-right: 0;
        padding-bottom: 12px;
        padding-left: 0;
      }

      .playground-metronome-settings-budget-list {
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-metronome-settings-budget-list .platform-service-detail-page__property {
        grid-template-columns: max-content minmax(0, 1fr);
      }

      .playground-metronome-settings-budget-list .platform-service-detail-page__property-label {
        white-space: nowrap;
      }

      .playground-metronome-settings-budget-input-shell {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
      }

      .playground-metronome-settings-budget-control {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
      }

      .playground-metronome-settings-budget-input {
        box-sizing: border-box;
        width: 84px;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        font-size: 12px;
        text-align: right;
      }

      .playground-metronome-settings-budget-input:disabled {
        color: rgba(255, 255, 255, 0.38);
      }

      .playground-metronome-settings-budget-unit-switch {
        flex: 0 0 auto;
      }

      .metronome-access-add-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        line-height: 1;
        white-space: nowrap;
      }

      .metronome-access-add-selector {
        align-self: center;
      }

      .metronome-access-add-selector .platform-selector__trigger {
        min-height: var(--platform-control-height, 32px);
        line-height: 1;
      }

      .metronome-access-add-selector .platform-selector__value {
        align-items: center;
        overflow: visible;
      }

      .metronome-access-add-label > svg {
        display: block;
        flex: 0 0 14px;
        width: 14px;
        height: 14px;
        transform: none;
      }

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
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
        column-gap: 42px;
        row-gap: 24px;
        align-items: flex-start;
        width: 100%;
      }

      .playground-metronome-runs-table-shell {
        flex: 1 1 0;
        min-height: 0;
        width: 100%;
        overflow: auto;
      }

      .playground-metronome-runs-table-section.playground-team-grid-table-section {
        flex: 1 1 0;
        min-height: 0;
        min-width: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        height: auto;
        width: auto;
        align-self: stretch;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-metronome-runs-sidebar.platform-ui-card {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        position: sticky;
        top: 0;
      }

      .playground-metronome-runs-trigger-button.platform-button {
        width: 100%;
        margin-top: 8px;
      }

      @media (max-width: 980px) {
        .playground-metronome-runs-view {
          overflow-y: auto;
        }

        .playground-metronome-runs-layout {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-metronome-runs-sidebar.platform-ui-card {
          position: static;
          width: 100%;
        }
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
      .playground-metronome-run-detail::before {
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

      .playground-metronome-run-trace-empty-copy {
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

      .playground-metronome-run-trace-thread-title {
        margin: 12px 0 8px 26px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.92);
        font-size: 14px;
        font-weight: 400;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      .tb-runner-chat .playground-metronome-run-trace-step > .tb-thread-live-work-status {
        margin-left: 26px;
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

      .playground-metronome-condition-result {
        width: fit-content;
        max-width: 100%;
        margin: 8px auto 0;
        box-sizing: border-box;
        min-width: 0;
        display: grid;
        grid-template-columns: auto 40px auto;
        align-items: center;
      }

      .playground-metronome-condition-result__condition-node {
        width: auto;
        max-width: 100%;
        min-width: 0;
        height: 38px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 9px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 8px 12px;
        background: rgba(24, 24, 25, 0.94);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
      }

      .playground-metronome-condition-result__node-icon {
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        background: linear-gradient(180deg, #3159a8 0%, #172f68 100%);
        color: #fff;
      }

      .playground-metronome-condition-result__node-icon svg {
        width: 12px;
        height: 12px;
        stroke-width: 1.9;
      }

      .playground-metronome-condition-result__node-title {
        min-width: 0;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.15;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-condition-result__connector {
        min-width: 0;
        min-height: 38px;
        align-self: stretch;
        display: block;
      }

      .playground-metronome-condition-result__connector svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
      }

      .playground-metronome-condition-result__branch-line {
        fill: none;
        stroke: rgba(255, 255, 255, 0.18);
        stroke-width: 1px;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .playground-metronome-condition-result__branch-line.is-selected {
        stroke: rgba(255, 255, 255, 0.9);
        stroke-width: 1.25px;
      }

      .playground-metronome-condition-result__branch-arrow {
        fill: rgba(255, 255, 255, 0.28);
      }

      .playground-metronome-condition-result__branch-arrow.is-selected {
        fill: rgba(255, 255, 255, 0.9);
      }

      .playground-metronome-condition-result__options {
        width: max-content;
        max-width: 100%;
        min-width: 0;
        display: grid;
        gap: 12px;
      }

      .playground-metronome-condition-result__option {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        height: 38px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 10px;
        padding: 8px 11px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.25;
      }

      .playground-metronome-condition-result__option-label {
        min-width: 0;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-condition-result__option.is-selected {
        border-color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.9);
        color: #000;
      }

      @media (max-width: 720px) {
        .playground-metronome-condition-result {
          grid-template-columns: auto 32px auto;
        }
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

`;
