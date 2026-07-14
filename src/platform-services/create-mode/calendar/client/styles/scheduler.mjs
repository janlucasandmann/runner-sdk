export const CALENDAR_SCHEDULER_CSS = `
      .playground-tasks-scheduler {
        min-height: 100%;
        height: 100%;
        flex: 1;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        background: rgba(20, 20, 20, 0.6);
        overflow: hidden;
      }

      .playground-tasks-scheduler-sidebar {
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding: 18px 10px 14px;
        background: rgba(0, 0, 0, 0.7);
      }

      .playground-tasks-scheduler-sidebar-actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 0 14px;
      }

      .playground-tasks-scheduler-sidebar-button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        font-size: 13px;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease;
      }

      .playground-tasks-scheduler-sidebar-button:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-tasks-scheduler-sidebar-title {
        padding: 0 14px 8px;
        font-size: 10px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.46);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .playground-tasks-scheduler-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-right: 4px;
      }

      .playground-tasks-scheduler-sidebar-empty,
      .playground-tasks-scheduler-sidebar-loading {
        margin: 0 14px;
        padding: 14px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 12px;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-tasks-scheduler-sidebar-loading {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-tasks-scheduler-listitem {
        width: calc(100% - 8px);
        margin-left: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 12px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease;
      }

      .playground-tasks-scheduler-listitem:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-tasks-scheduler-listitem.is-active {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-scheduler-listitem-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }

      .playground-tasks-scheduler-listitem-title {
        min-width: 0;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
        color: #fff;
      }

      .playground-tasks-scheduler-listitem-copy {
        font-size: 12px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.46);
        word-break: break-word;
      }

      .playground-tasks-schedule-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 20px;
        padding: 0 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
      }

      .playground-tasks-schedule-status.is-planned {
        background: rgba(96, 165, 250, 0.18);
        color: #7fb6ff;
      }

      .playground-tasks-schedule-status.is-active {
        background: rgba(134, 239, 172, 0.18);
        color: #96ebb2;
      }

      .playground-tasks-schedule-status.is-completed {
        background: rgba(216, 180, 254, 0.18);
        color: #ddb8ff;
      }

      .playground-tasks-schedule-status.is-disabled {
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-tasks-scheduler-main {
        min-width: 0;
        min-height: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: rgba(20, 20, 20, 0.6);
      }

      .playground-tasks-scheduler-surface {
        flex: 1;
        min-height: 0;
        height: 100%;
        position: relative;
        overflow: hidden;
      }

      .playground-tasks-scheduler-calendar-surface {
        padding: 0;
      }

      .playground-tasks-scheduler-editor,
      .playground-tasks-scheduler-details {
        padding: 24px;
        overflow-y: auto;
      }

      .playground-tasks-scheduler-modal-backdrop {
        position: absolute;
        inset: 0;
        z-index: 12;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.46);
        backdrop-filter: blur(8px);
      }

      .playground-tasks-scheduler-modal-panel {
        width: min(100%, 840px);
        max-height: min(100%, 820px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 22px;
        background: rgba(18, 18, 18, 0.96);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
        overflow: hidden;
      }

      .playground-tasks-scheduler-modal-panel .playground-tasks-scheduler-editor {
        height: 100%;
        max-height: min(100%, 820px);
        padding: 24px;
      }

      .playground-tasks-scheduler-modal-panel .playground-tasks-scheduler-editor-scroll {
        max-width: none;
      }

      .playground-tasks-schedule-side-scroll {
        gap: 16px;
        background: transparent;
      }

      .playground-tasks-schedule-side-scroll .playground-tasks-scheduler-form-card {
        border-radius: 18px;
        box-shadow: none;
      }

      .playground-tasks-schedule-side-scroll .playground-tasks-scheduler-form-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .playground-tasks-scheduler-editor-header {
        position: sticky;
        top: 0;
        z-index: 4;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 8px 0 24px;
        background: linear-gradient(180deg, rgba(20, 20, 20, 0.92), rgba(20, 20, 20, 0.7) 70%, rgba(20, 20, 20, 0));
      }

      .playground-tasks-scheduler-editor-title {
        font-size: 14px;
        font-weight: 500;
        color: #fff;
      }

      .playground-tasks-scheduler-editor-actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-tasks-scheduler-editor-scroll {
        max-width: 760px;
        margin: 0 auto;
      }

      .playground-tasks-scheduler-form-card,
      .playground-tasks-scheduler-card {
        position: relative;
        border-radius: 25px;
        padding: 24px;
        background: rgba(0, 0, 0, 0.36);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
      }

      .playground-tasks-scheduler-form-card {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-tasks-scheduler-form-heading {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
      }

      .playground-tasks-scheduler-form-copy {
        margin-top: -10px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 12px;
        line-height: 1.55;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-tasks-scheduler-form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .playground-tasks-scheduler-field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-tasks-scheduler-field.is-full {
        grid-column: 1 / -1;
      }

      .playground-tasks-scheduler-label {
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-tasks-scheduler-input,
      .playground-tasks-scheduler-select,
      .playground-tasks-scheduler-textarea {
        width: 100%;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.04);
        color: #fff;
        font-size: 12px;
        font-family: inherit;
        outline: none;
        transition: border-color 160ms ease, background-color 160ms ease;
      }

      .playground-tasks-scheduler-input,
      .playground-tasks-scheduler-select {
        min-height: 38px;
        padding: 0 12px;
      }

      .playground-tasks-scheduler-textarea {
        min-height: 132px;
        padding: 12px;
        resize: vertical;
      }

      .playground-tasks-scheduler-input:focus,
      .playground-tasks-scheduler-select:focus,
      .playground-tasks-scheduler-textarea:focus {
        border-color: rgba(1, 107, 223, 0.75);
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-tasks-scheduler-switch {
        width: fit-content;
      }

      .playground-tasks-schedule-detail-shell .playground-tasks-detail-main,
      .playground-tasks-schedule-detail-shell .playground-tasks-detail-body {
        background: transparent;
      }

      .playground-tasks-schedule-detail-facts {
        margin-top: 2px;
      }

      .playground-tasks-schedule-detail-control {
        width: 100%;
        justify-content: flex-end;
      }

      .playground-tasks-schedule-inline-description {
        margin-top: 8px;
      }

      .playground-tasks-schedule-detail-input {
        width: min(100%, 290px);
      }

      .playground-tasks-scheduler-detail-actions {
        position: absolute;
        top: 24px;
        right: 24px;
        z-index: 3;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-tasks-scheduler-detail-scroll {
        max-width: 760px;
        margin: 0 auto;
        padding-top: 46px;
        display: flex;
        flex-direction: column;
        gap: 28px;
      }

      .playground-tasks-scheduler-detail-hero {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .playground-tasks-scheduler-detail-title {
        margin: 0;
        font-size: 32px;
        line-height: 1.1;
        font-weight: 500;
        color: #fff;
      }

      .playground-tasks-scheduler-detail-description {
        margin: 0;
        max-width: 520px;
        font-size: 14px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-tasks-scheduler-card {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-tasks-scheduler-card-row,
      .playground-tasks-scheduler-card-stats {
        display: grid;
        gap: 18px;
      }

      .playground-tasks-scheduler-card-stats {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        padding-top: 22px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-tasks-scheduler-card-label {
        margin-bottom: 6px;
        font-size: 11px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.42);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .playground-tasks-scheduler-card-value {
        font-size: 14px;
        line-height: 1.45;
        color: #fff;
      }

      .playground-tasks-scheduler-card-value.is-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }

      .playground-tasks-scheduler-runs {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-tasks-scheduler-runs-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-tasks-scheduler-runs-legend {
        display: inline-flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
      }

      .playground-tasks-scheduler-runs-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.54);
      }

      .playground-tasks-scheduler-runs-legend-dot {
        width: 6px;
        height: 6px;
        border-radius: 2px;
      }

      .playground-tasks-scheduler-runs-legend-dot.is-success {
        background: #1a6bf0;
      }

      .playground-tasks-scheduler-runs-legend-dot.is-failure {
        background: #7f1d1d;
      }

      .playground-tasks-scheduler-runs-bar {
        width: 100%;
        height: 8px;
        display: flex;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-scheduler-runs-segment.is-success {
        background: #1a6bf0;
      }

      .playground-tasks-scheduler-runs-segment.is-failure {
        background: #7f1d1d;
      }

      .playground-tasks-scheduler-empty-state {
        height: 100%;
        min-height: 760px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        padding: 24px;
        text-align: center;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-tasks-scheduler-empty-title {
        font-size: 18px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-tasks-scheduler-empty-copy {
        max-width: 420px;
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-tasks-scheduler .rbc-month-view {
        box-sizing: border-box;
        border: none !important;
        border-left: none !important;
        border-right: none !important;
        margin-top: 10px;
        padding: 0 12px;
      }

      .playground-tasks-scheduler .rbc-time-view,
      .playground-tasks-scheduler .rbc-agenda-view {
        box-sizing: border-box;
        margin-top: 10px;
        padding: 0 12px;
      }

      .playground-tasks-scheduler .rbc-month-header {
        border-top: none !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .playground-tasks-scheduler .rbc-header {
        border-top: none;
        color: white;
        font-weight: 400 !important;
        font-size: 0.75rem !important;
        border: none !important;
        padding-bottom: 0.25rem !important;
      }

      .playground-tasks-scheduler .rbc-toolbar-label {
        font-size: 1.25rem !important;
        color: white;
        font-weight: 600;
      }

      .playground-tasks-scheduler .rbc-toolbar {
        padding: 0 12px 12px !important;
        margin-bottom: 22px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler .rbc-toolbar {
        padding: 0 12px 12px !important;
      }

      .playground-tasks-scheduler .rbc-off-range .rbc-button-link {
        color: rgba(255, 255, 255, 0.4) !important;
      }

      .playground-tasks-scheduler .rbc-button-link {
        color: white !important;
        margin-top: 0.25rem !important;
        width: 26px;
        height: 26px;
        font-size: 0.875rem !important;
        border-radius: 50%;
      }

      .playground-tasks-scheduler .rbc-now .rbc-button-link {
        font-weight: 400 !important;
        background: #016bdf !important;
        color: white !important;
      }

      .playground-tasks-scheduler .rbc-today {
        background: transparent !important;
      }

      .playground-tasks-scheduler .rbc-event {
        margin: 0.25rem !important;
        width: calc(100% - 0.5rem) !important;
        border-radius: 8px !important;
        background: var(--playground-calendar-event-surface, rgba(1, 107, 203, 0.1)) !important;
        border: none !important;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .playground-tasks-scheduler .rbc-event-content {
        font-size: 0.75rem !important;
        padding: 4px 4px 2px !important;
        color: var(--playground-calendar-event-text, rgba(124, 197, 255, 0.95)) !important;
      }

      .playground-tasks-scheduler .rbc-month-view .rbc-event {
        border-radius: 5px !important;
      }

      .playground-tasks-scheduler .rbc-time-view .rbc-event {
        margin: 0 !important;
        height: 34px !important;
        min-height: 34px !important;
        margin-top: 3px !important;
        width: calc(100% - 4px) !important;
        border-radius: 5px !important;
      }

      .playground-tasks-scheduler .rbc-day-slot .rbc-event,
      .playground-tasks-scheduler .rbc-day-slot .rbc-background-event {
        left: 2px !important;
        right: 2px !important;
        width: auto !important;
      }

      .playground-tasks-scheduler .rbc-time-view .rbc-event-content {
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 4px !important;
      }

      .playground-tasks-calendar-event-inner {
        width: 100%;
        min-width: 0;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .playground-tasks-calendar-event-type-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        color: white;
      }

      .playground-tasks-calendar-event-type-icon svg {
        width: 9px;
        height: 9px;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.24));
      }

      .playground-tasks-calendar-event-type-icon.is-task {
        background: linear-gradient(180deg, #39b877 0%, #2b8b59 100%);
      }

      .playground-tasks-calendar-event-type-icon.is-subtask {
        background: linear-gradient(180deg, #4f7fc5 0%, #1e4585 100%);
      }

      .playground-tasks-calendar-event-type-icon.is-metronome {
        background: linear-gradient(180deg, #125ffb 0%, #0d48fb 100%);
      }

      .playground-tasks-calendar-event-priority {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        gap: 0;
      }

      .playground-tasks-calendar-event-priority .playground-tasks-priority-value-icon {
        width: 14px;
        height: 14px;
      }

      .playground-tasks-calendar-event-title {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.1;
      }

      .playground-tasks-scheduler .rbc-label {
        color: rgba(255, 255, 255, 0.5) !important;
        font-size: 0.75rem !important;
      }

      .playground-tasks-scheduler .rbc-time-header-gutter,
      .playground-tasks-scheduler .rbc-time-header,
      .playground-tasks-scheduler .rbc-time-view,
      .playground-tasks-scheduler .rbc-time-column {
        border: none !important;
      }

      .playground-tasks-scheduler .rbc-time-header-content {
        border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .playground-tasks-scheduler .rbc-allday-cell {
        height: 0 !important;
      }

      .playground-tasks-scheduler .rbc-timeslot-group .rbc-time-slot:last-child {
        display: none !important;
      }

      .playground-tasks-scheduler .rbc-timeslot-group .rbc-time-slot {
        display: flex;
        align-items: center;
      }

      .playground-tasks-scheduler .rbc-current-time-indicator {
        background: #016bdf !important;
      }

      .playground-tasks-scheduler .rbc-event-label {
        display: none !important;
      }

      .playground-tasks-scheduler .rbc-agenda-view {
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
      }

      .playground-tasks-scheduler .rbc-agenda-empty {
        font-size: 0.75rem;
        color: white !important;
      }

      .playground-tasks-scheduler .rbc-agenda-table {
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .playground-tasks-scheduler .rbc-agenda-date-cell,
      .playground-tasks-scheduler .rbc-agenda-time-cell,
      .playground-tasks-scheduler .rbc-agenda-event-cell {
        font-size: 0.75rem !important;
        color: white !important;
        line-height: 1rem !important;
      }

      .playground-tasks-scheduler .rbc-agenda-view table.rbc-agenda-table tbody tr td {
        padding-bottom: 1rem !important;
        padding-top: 1rem !important;
        padding-left: 5px !important;
        border-right: none !important;
        border-left: none !important;
        font-weight: 500 !important;
      }

      .playground-tasks-scheduler .rbc-off-range-bg {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      .playground-tasks-scheduler .rbc-month-row {
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .playground-tasks-scheduler .rbc-day-bg {
        border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .playground-tasks-scheduler .rbc-month-row .rbc-day-bg:first-child,
      .playground-tasks-scheduler .rbc-time-header-content,
      .playground-tasks-scheduler .rbc-time-content > *:first-child {
        border-left: none !important;
      }

      .playground-tasks-scheduler .rbc-time-content > * + * > * {
        border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .playground-tasks-scheduler .rbc-timeslot-group {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .playground-tasks-scheduler .rbc-day-slot .rbc-time-slot {
        border-top: none !important;
      }

      .playground-tasks-scheduler .rbc-time-content {
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

`;
