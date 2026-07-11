export const PROJECT_OVERVIEW_CSS = String.raw`
      .playground-project-overview-view {
        position: relative;
        isolation: isolate;
        width: min(100%, 56rem);
        margin: 0 auto;
        gap: 24px;
      }

      .playground-project-overview-view.is-general {
        width: 100%;
        max-width: none;
      }

      .playground-project-overview-layout {
        width: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
        column-gap: 42px;
        row-gap: 42px;
        align-items: start;
        transition:
          grid-template-columns 260ms cubic-bezier(0.16, 1, 0.3, 1),
          column-gap 260ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .playground-project-overview-layout.is-sidebar-collapsed {
        grid-template-columns: minmax(0, 1fr) minmax(0, 0px);
        column-gap: 0;
      }

      .playground-project-overview-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .playground-project-overview-sidebar {
        min-width: 0;
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: hidden;
        opacity: 1;
        transform: translateX(0);
        visibility: visible;
        pointer-events: auto;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        transition:
          opacity 180ms ease,
          transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
          visibility 0s linear 0s;
      }

      .playground-project-overview-layout.is-sidebar-collapsed .playground-project-overview-sidebar {
        opacity: 0;
        transform: translateX(18px);
        visibility: hidden;
        pointer-events: none;
        transition-delay: 0s, 0s, 180ms;
      }

      .playground-project-overview-sidebar-card {
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        padding: 12px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
      }

      .playground-project-overview-sidebar-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }

      .playground-project-overview-sidebar-title {
        min-width: 0;
        margin: 0;
        font-size: 12px;
        line-height: 1.3;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-project-overview-sidebar-title-with-caret {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .playground-project-overview-sidebar-title-caret {
        width: 10px;
        height: 10px;
        color: rgba(255, 255, 255, 0.46);
      }

      .playground-project-overview-sidebar-see-all {
        flex: 0 0 auto;
        border: 0;
        background: transparent;
        padding: 0;
        color: rgba(255, 255, 255, 0.56);
        font: inherit;
        font-size: 11px;
        line-height: 1;
        cursor: pointer;
      }

      .playground-project-overview-sidebar-see-all:hover {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-sidebar-action {
        flex: 0 0 auto;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.56);
        font: inherit;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
      }

      .playground-project-overview-sidebar-action:hover {
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-sidebar-rows {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-project-overview-sidebar-row {
        min-width: 0;
        min-height: 32px;
        display: grid;
        grid-template-columns: minmax(88px, 0.85fr) minmax(0, 1.35fr);
        gap: 12px;
        align-items: center;
        padding: 6px 0;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-project-overview-sidebar-row-label {
        min-width: 0;
        font-size: 12px;
        line-height: 1.25;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-project-overview-sidebar-row-value {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 7px;
        font-size: 12px;
        line-height: 1.25;
        color: rgba(255, 255, 255, 0.88);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-overview-sidebar-row-value.is-editable {
        overflow: visible;
        white-space: normal;
      }

      .playground-project-overview-sidebar-row-value.is-full {
        width: 100%;
      }

      .playground-project-overview-sidebar-select-shell {
        position: relative;
        z-index: 1;
        min-width: 0;
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
      }

      .playground-project-overview-sidebar-select-shell.is-open {
        z-index: 340;
      }

      .playground-project-overview-sidebar-select-trigger {
        min-width: 0;
        max-width: 100%;
        min-height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 6px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        padding: 0;
        color: rgba(255, 255, 255, 0.86);
        font: inherit;
        font-size: 12px;
        line-height: 1.25;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-sidebar-select-trigger:hover,
      .playground-project-overview-sidebar-select-trigger.is-open {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-sidebar-select-trigger.is-empty {
        color: rgba(255, 255, 255, 0.46);
      }

      .playground-project-overview-sidebar-select-trigger-copy {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-overview-sidebar-select-trigger-caret {
        width: 12px;
        height: 12px;
        flex: 0 0 12px;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-project-overview-sidebar-select-menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: auto;
        z-index: 360;
        width: min(280px, calc(100vw - 48px));
        max-height: min(320px, calc(100vh - 120px));
        overflow: auto;
        padding: 6px;
      }

      .playground-project-overview-sidebar-select-option {
        width: 100%;
        min-height: 34px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 16px;
        align-items: center;
        gap: 10px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        padding: 7px 8px;
        color: rgba(255, 255, 255, 0.82);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-sidebar-select-option:hover,
      .playground-project-overview-sidebar-select-option.is-selected {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-sidebar-select-option-main {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
      }

      .playground-project-overview-sidebar-select-option-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-project-overview-sidebar-select-option-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-project-overview-sidebar-select-option-description {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        line-height: 1.25;
        color: rgba(255, 255, 255, 0.46);
      }

      .playground-project-overview-sidebar-select-option-check {
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-project-overview-sidebar-date-fields {
        width: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 6px;
      }

      .playground-project-overview-sidebar-date-field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-project-overview-sidebar-date-field-label {
        font-size: 9px;
        line-height: 1;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-project-overview-sidebar-date-input {
        min-width: 0;
        width: 100%;
        height: 24px;
        border: 0;
        border-radius: 0;
        background: transparent;
        padding: 0;
        color: rgba(255, 255, 255, 0.84);
        font: inherit;
        font-size: 11px;
        line-height: 1;
        color-scheme: dark;
        outline: none;
      }

      .playground-project-overview-sidebar-date-input:focus {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-sidebar-select-option .playground-tasks-priority-value,
      .playground-project-overview-sidebar-select-trigger .playground-tasks-priority-value {
        font-size: 12px;
        line-height: 1.25;
      }

      .playground-project-overview-sidebar-milestone-row {
        position: relative;
        display: grid;
        align-items: center;
        gap: 6px;
        grid-template-columns: minmax(0, 1fr) auto;
        width: 100%;
        color: inherit;
        font: inherit;
        text-align: left;
        overflow: visible;
      }

      .playground-project-overview-sidebar-milestone-trigger {
        appearance: none;
        min-width: 0;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-sidebar-milestone-row .playground-project-overview-sidebar-chip {
        width: 100%;
        justify-content: space-between;
        padding: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-project-overview-sidebar-milestone-trigger:hover .playground-project-overview-sidebar-chip {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-sidebar-card,
      .playground-project-overview-sidebar-rows {
        overflow: visible;
      }

      .playground-project-overview-sidebar-icon-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        flex: 0 0 26px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.66);
        cursor: pointer;
      }

      .playground-project-overview-sidebar-icon-button:hover,
      .playground-project-overview-sidebar-milestone-menu-shell.is-open .playground-project-overview-sidebar-icon-button {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-sidebar-milestone-menu-shell {
        position: relative;
        display: inline-flex;
        justify-content: flex-end;
        z-index: 240;
      }

      .playground-project-overview-sidebar-milestone-menu-shell.is-open {
        z-index: 420;
      }

      .playground-project-overview-sidebar-milestone-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        left: auto;
        min-width: 190px;
        width: max-content;
        max-width: min(260px, calc(100vw - 32px));
        padding: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        background: #323232;
        color: rgba(255, 255, 255, 0.94);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        overflow: hidden;
        z-index: 480;
        transform-origin: top right;
      }

      .playground-project-overview-sidebar-muted {
        color: rgba(255, 255, 255, 0.45);
      }

      .playground-project-overview-sidebar-status-dot {
        width: 7px;
        height: 7px;
        flex: 0 0 7px;
        border-radius: 999px;
        background: #66a6ff;
        box-shadow: 0 0 0 3px rgba(102, 166, 255, 0.12);
      }

      .playground-project-overview-sidebar-lead {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .playground-project-overview-sidebar-avatar {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        border-radius: 999px;
        object-fit: cover;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.84);
        font-size: 9px;
        line-height: 1;
        font-weight: 500;
      }

      .playground-project-overview-sidebar-chip {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 3px 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.07);
        color: rgba(255, 255, 255, 0.82);
        font-size: 11px;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-overview-sidebar-resource-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-project-overview-sidebar-resource-row {
        width: 100%;
        min-width: 0;
        min-height: 34px;
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        padding: 6px 4px;
        color: rgba(255, 255, 255, 0.86);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-sidebar-resource-row:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-project-overview-sidebar-resource-icon {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-project-overview-sidebar-resource-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-project-overview-sidebar-resource-count {
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.25;
        font-variant-numeric: tabular-nums;
      }

      .playground-project-overview-sidebar-activity-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .playground-project-overview-sidebar-activity-row {
        min-width: 0;
        display: grid;
        grid-template-columns: 20px minmax(0, 1fr);
        align-items: start;
        gap: 8px;
      }

      .playground-project-overview-sidebar-activity-row .playground-project-overview-activity-avatar {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        margin-top: 0;
        border-radius: 999px;
      }

      .playground-project-overview-sidebar-activity-icon {
        width: 14px;
        height: 14px;
        margin-top: 1px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-sidebar-activity-icon.is-task {
        color: rgb(122, 126, 255);
      }

      .playground-project-overview-sidebar-activity-icon.is-file {
        color: rgb(102, 166, 255);
      }

      .playground-project-overview-sidebar-activity-icon.is-thread,
      .playground-project-overview-sidebar-activity-icon.is-update {
        color: rgb(74, 222, 128);
      }

      .playground-project-overview-sidebar-activity-copy {
        min-width: 0;
        font-size: 12px;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-project-overview-sidebar-activity-copy strong {
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-sidebar-activity-object {
        display: inline;
        border: 0;
        padding: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.88);
        font: inherit;
        font-weight: 500;
        cursor: pointer;
      }

      .playground-project-overview-sidebar-activity-object:hover {
        color: #66a6ff;
      }

      .playground-project-overview-sidebar-activity-time {
        color: rgba(255, 255, 255, 0.46);
      }

      .playground-project-overview-sidebar-empty {
        padding: 4px 0 2px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-project-overview-hero-shell {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
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
        margin-top: 0;
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
        margin-top: 10px;
        font-size: 12px;
        line-height: 1.7;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.68);
        background: transparent;
      }

      .playground-project-overview-summary-description .tb-message-markdown {
        margin: 0;
        color: inherit;
        font-size: inherit;
        line-height: inherit;
        font-weight: inherit;
        background: transparent;
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

      .playground-project-overview-summary-kpis {
        width: calc(100% + 40px);
        margin-left: -20px;
        padding: 20px;
        margin-top: -20px;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-project-overview-chart-kpis {
        margin-bottom: 12px;
        background: rgba(0, 0, 0, 0.35);
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
        --playground-project-overview-control-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        flex: 0 0 auto;
        margin-left: auto;
        position: relative;
        z-index: 0;
        overflow: hidden;
        border: 0;
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

      .playground-project-overview-sidebar-toggle {
        flex: 0 0 auto;
        width: 30px;
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.68);
        padding: 0;
        cursor: pointer;
        transition: background 160ms ease, color 160ms ease;
      }

      .playground-project-overview-sidebar-toggle:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.95);
      }

      .playground-project-overview-summary-mission-button::before {
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

      .playground-project-overview-summary-mission-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-project-overview-summary-strategy-button {
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-summary-strategy-button:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.16);
        color: rgba(255, 255, 255, 0.9);
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
        margin: 0 0 24px;
        padding: 0;
        border-radius: 0;
        background: transparent;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-project-overview-chart-card {
        --playground-project-overview-chart-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        box-sizing: border-box;
        min-width: 0;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 20px;
        border: 0;
        border-radius: 15px;
        background: transparent;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-project-overview-chart-surface .playground-project-overview-chart-card {
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
      }

      .playground-project-overview-chart-surface .playground-project-overview-summary-kpis.playground-project-overview-chart-kpis {
        background: transparent;
      }

      .playground-project-overview-chart-card::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-chart-card.is-donut {
        min-height: 0;
      }

      .playground-project-overview-chart-card.is-cost-empty {
        background: #000;
      }

      .playground-project-overview-general-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 24px;
        width: 100%;
      }

      .playground-project-overview-general-goal {
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-project-overview-general-goal-title {
        margin: 0;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-project-overview-general-goal-text {
        max-width: 920px;
        margin: 0;
        white-space: pre-wrap;
        font-size: 14px;
        line-height: 1.55;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-project-overview-general-goal-text.is-empty {
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-project-overview-progress-combo-card {
        --playground-project-overview-chart-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 438px;
        padding: 18px 18px 14px;
        border: 0;
        border-radius: 15px;
        background: transparent;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
        color: rgba(255, 255, 255, 0.96);
        overflow: hidden;
        box-shadow: none;
      }

      .playground-project-overview-progress-combo-card::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
        z-index: 2;
      }

      .playground-project-overview-progress-combo-card > * {
        position: relative;
        z-index: 1;
      }

      .playground-project-overview-progress-combo-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      .playground-project-overview-progress-combo-title {
        margin: 0;
        font-size: 14px;
        line-height: 1.3;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-progress-combo-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        min-width: 0;
      }

      .playground-project-overview-progress-combo-ranges {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        height: 24px;
        padding: 2px;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        background: transparent;
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
      }

      .playground-project-overview-progress-combo-range {
        height: 18px;
        min-width: 28px;
        padding: 0 7px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font: inherit;
        font-size: 11px;
        line-height: 1rem;
        font-weight: 400;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease;
      }

      .playground-project-overview-progress-combo-range:hover {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-progress-combo-range.is-active {
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
      }

      .playground-project-overview-progress-combo-download {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: rgba(255, 255, 255, 0.74);
        box-shadow: none;
        cursor: pointer;
      }

      .playground-project-overview-progress-combo-download:hover {
        color: #fff;
        background: transparent;
      }

      .playground-project-overview-progress-combo-meta {
        display: inline-block;
        margin-left: 4px;
        vertical-align: baseline;
        font-size: 12px;
        line-height: 1.3;
        color: rgba(255, 255, 255, 0.52);
        white-space: nowrap;
      }

      .playground-project-overview-progress-combo-chart {
        width: 100%;
        min-width: 0;
        flex: 1 1 auto;
        position: relative;
      }

      .playground-project-overview-progress-combo-chart-frame {
        position: relative;
        width: 100%;
        height: 284px;
        min-height: 284px;
      }

      .playground-project-overview-progress-combo-canvas {
        display: block;
        width: 100% !important;
        height: 284px !important;
      }

      .playground-project-overview-progress-combo-metrics {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        min-width: 0;
      }

      .playground-project-overview-progress-combo-metric {
        min-width: 0;
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .playground-project-overview-progress-combo-metric-label {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        line-height: 1.25;
        color: rgba(255, 255, 255, 0.62);
        font-weight: 500;
      }

      .playground-project-overview-progress-combo-metric-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.45);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.04);
      }

      .playground-project-overview-progress-combo-metric-dot.is-cost {
        background: rgb(95, 112, 230);
        box-shadow: 0 0 0 3px rgba(95, 112, 230, 0.12);
      }

      .playground-project-overview-progress-combo-metric-dot.is-completed {
        background: #4da3ff;
        box-shadow: 0 0 0 3px rgba(77, 163, 255, 0.12);
      }

      .playground-project-overview-progress-combo-metric-dot.is-started {
        background: #7effff;
        box-shadow: 0 0 0 3px rgba(126, 255, 255, 0.12);
      }

      .playground-project-overview-progress-combo-metric-dot.is-scope {
        background: rgba(255, 255, 255, 0.45);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.04);
      }

      .playground-project-overview-progress-combo-metric-value {
        color: rgba(255, 255, 255, 0.86);
        font-size: 18px;
        line-height: 1.1;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-project-overview-progress-combo-ct {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        font-size: 12px;
        line-height: 1.3;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-project-overview-progress-combo-ct-swatch {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        background: rgb(95, 112, 230);
      }

      .playground-project-overview-progress-swatch.is-cost {
        background: rgb(95, 112, 230);
      }

      @media (max-width: 760px) {
        .playground-project-overview-progress-combo-card {
          min-height: 0;
          padding: 16px 14px 12px;
        }

        .playground-project-overview-progress-combo-topbar {
          align-items: flex-start;
          flex-direction: column;
        }

        .playground-project-overview-progress-combo-actions {
          width: 100%;
          justify-content: space-between;
        }

        .playground-project-overview-progress-combo-ranges {
          overflow-x: auto;
          max-width: calc(100% - 38px);
        }

        .playground-project-overview-progress-combo-metrics {
          gap: 18px;
          flex-wrap: wrap;
        }

        .playground-project-overview-progress-combo-metric-value {
          font-size: 24px;
        }

        .playground-project-overview-progress-combo-chart-frame,
        .playground-project-overview-progress-combo-canvas {
          height: 240px !important;
          min-height: 240px;
        }
      }

      @media (max-width: 1180px) {
        .playground-project-overview-layout {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-project-overview-layout.is-sidebar-collapsed .playground-project-overview-sidebar {
          max-height: 0;
        }

        .playground-project-overview-sidebar {
          position: static;
        }
      }

      .playground-project-overview-widget-grid {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        align-items: stretch;
      }

      .playground-project-overview-widget {
        --playground-home-widget-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        min-width: 0;
        min-height: 0;
        height: auto;
        aspect-ratio: 1 / 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border: 0;
        border-radius: 25px;
        background: transparent;
        box-shadow: none;
        backdrop-filter: blur(20px);
        color: rgba(255, 255, 255, 0.96);
        overflow: hidden;
      }

      .playground-project-overview-widget::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 20;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-home-widget-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-widget > * {
        position: relative;
        z-index: 1;
      }

      .playground-project-overview-widget-header {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-project-overview-widget-title-wrap {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-project-overview-widget-icon {
        width: 26px;
        height: 26px;
        flex: 0 0 26px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-widget-icon svg {
        width: 14px;
        height: 14px;
      }

      .playground-project-overview-widget-title {
        min-width: 0;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-project-overview-widget-action {
        flex: 0 0 auto;
        min-width: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.54);
        font-size: 11px;
        line-height: 1.2;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-project-overview-widget-action:hover {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-widget-progress-chart {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 8px;
      }

      .playground-project-overview-widget-progress-svg {
        width: 100%;
        height: 86px;
        display: block;
        overflow: visible;
      }

      .playground-project-overview-widget-progress-guide {
        stroke: rgba(255, 255, 255, 0.08);
        stroke-width: 1;
        stroke-dasharray: 4 6;
      }

      .playground-project-overview-widget-progress-axis {
        stroke: rgba(255, 255, 255, 0.12);
        stroke-width: 1;
      }

      .playground-project-overview-widget-progress-line {
        fill: none;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .playground-project-overview-widget-progress-line.is-scope {
        stroke: rgba(255, 255, 255, 0.42);
        stroke-dasharray: 7 8;
      }

      .playground-project-overview-widget-progress-line.is-started {
        stroke: rgb(122, 126, 255);
      }

      .playground-project-overview-widget-progress-line.is-completed {
        stroke: rgb(56, 204, 164);
      }

      .playground-project-overview-widget-progress-dot {
        stroke: #050505;
        stroke-width: 2;
      }

      .playground-project-overview-widget-rows {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-project-overview-widget-row {
        min-height: 30px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-widget-row:last-child {
        border-bottom: 0;
      }

      .playground-project-overview-widget-row-name {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        line-height: 1.25;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-project-overview-widget-swatch {
        width: 7px;
        height: 7px;
        flex: 0 0 7px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.45);
      }

      .playground-project-overview-widget-swatch.is-started {
        background: rgb(122, 126, 255);
      }

      .playground-project-overview-widget-swatch.is-completed {
        background: rgb(56, 204, 164);
      }

      .playground-project-overview-widget-row-percent,
      .playground-project-overview-widget-row-value {
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.25;
        white-space: nowrap;
      }

      .playground-project-overview-widget-row-value {
        color: rgba(255, 255, 255, 0.82);
        text-align: right;
      }

      .playground-project-overview-cost-widget-main {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-project-overview-cost-widget-value {
        font-size: 26px;
        line-height: 1;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-project-overview-cost-widget-label {
        margin-top: -6px;
        font-size: 10px;
        line-height: 1.2;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-project-overview-cost-widget-bars {
        flex: 1 1 auto;
        min-height: 0;
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        align-items: end;
        gap: 5px;
        padding-top: 4px;
      }

      .playground-project-overview-cost-widget-bar {
        min-width: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 0;
      }

      .playground-project-overview-cost-widget-segment {
        width: 100%;
        min-height: 1px;
        border-radius: 3px;
      }

      .playground-project-overview-widget-list {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        overflow-y: auto;
        scrollbar-width: none;
      }

      .playground-project-overview-widget-list::-webkit-scrollbar {
        display: none;
      }

      .playground-project-overview-widget-list-item {
        min-width: 0;
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr);
        align-items: center;
        gap: 9px;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
      }

      button.playground-project-overview-widget-list-item {
        cursor: pointer;
      }

      button.playground-project-overview-widget-list-item:hover .playground-project-overview-widget-list-title {
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-project-overview-widget-list-icon {
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
      }

      .playground-project-overview-widget-list-icon svg {
        width: 13px;
        height: 13px;
      }

      .playground-project-overview-widget-list-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-project-overview-widget-list-title {
        min-width: 0;
        font-size: 11px;
        line-height: 1.25;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.88);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-project-overview-widget-list-meta {
        min-width: 0;
        font-size: 10px;
        line-height: 1.2;
        color: rgba(255, 255, 255, 0.46);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-project-overview-widget-empty {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.45;
        text-align: center;
      }

      .playground-project-overview-widget-metric {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 6px;
      }

      .playground-project-overview-widget-metric-value {
        color: rgba(255, 255, 255, 0.98);
        font-size: 32px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-project-overview-widget-metric-label {
        color: rgba(255, 255, 255, 0.62);
        font-size: 11px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-project-overview-widget-metric-meta {
        color: rgba(255, 255, 255, 0.46);
        font-size: 10px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-project-overview-setup-section {
        --playground-home-widget-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        overflow: hidden;
      }

      .playground-project-overview-setup-section::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 20;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-home-widget-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-setup-section > * {
        position: relative;
        z-index: 1;
      }

      .playground-project-overview-general-empty-state {
        --playground-home-widget-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        min-height: 438px;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px 20px;
        border: 0;
        border-radius: 15px;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
        overflow: hidden;
      }

      .playground-project-overview-general-empty-state::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 20;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-home-widget-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-project-overview-general-empty-state > * {
        position: relative;
        z-index: 1;
      }

      .playground-project-overview-general-empty-content {
        min-height: 320px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-project-overview-general-empty-action {
        margin-top: 8px;
      }

      .playground-project-overview-general-empty-action .playground-tasks-empty-primary-button {
        font-weight: 500;
      }

      .playground-project-overview-general-empty-button {
        font-weight: 500;
      }

      .playground-project-overview-progress-card {
        min-height: 360px;
      }

      .playground-project-overview-progress-chart {
        width: 100%;
        min-height: 180px;
        margin-top: 4px;
      }

      .playground-project-overview-progress-svg {
        display: block;
        width: 100%;
        max-width: none;
        height: 190px;
        overflow: visible;
      }

      .playground-project-overview-progress-axis {
        stroke: rgba(255, 255, 255, 0.12);
        stroke-width: 1;
      }

      .playground-project-overview-progress-weekend {
        fill: rgba(255, 255, 255, 0.035);
      }

      .playground-project-overview-progress-guide {
        stroke: rgba(255, 255, 255, 0.08);
        stroke-width: 1;
        stroke-dasharray: 5 7;
      }

      .playground-project-overview-progress-line {
        fill: none;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .playground-project-overview-progress-line.is-scope {
        stroke: rgba(255, 255, 255, 0.42);
        stroke-dasharray: 7 8;
      }

      .playground-project-overview-progress-line.is-started {
        stroke: rgb(122, 126, 255);
      }

      .playground-project-overview-progress-line.is-completed {
        stroke: rgb(56, 204, 164);
      }

      .playground-project-overview-progress-dot {
        stroke: #050505;
        stroke-width: 2;
      }

      .playground-project-overview-progress-labels {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
        font-size: 12px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-project-overview-progress-summary {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px 24px;
        padding: 4px 0 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-progress-summary-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        font-size: 13px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-project-overview-progress-summary-item strong {
        font-size: 18px;
        line-height: 1.1;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-progress-swatch {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        flex: 0 0 auto;
        background: rgba(255, 255, 255, 0.45);
      }

      .playground-project-overview-progress-swatch.is-started {
        background: #7effff;
      }

      .playground-project-overview-progress-swatch.is-completed {
        background: #4da3ff;
      }

      .playground-project-overview-progress-swatch.is-scope {
        background: rgba(255, 255, 255, 0.45);
      }

      .playground-project-overview-progress-legend {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin-top: 8px;
      }

      .playground-project-overview-progress-legend-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 70px 72px;
        gap: 16px;
        align-items: center;
        min-height: 52px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 13px;
        line-height: 1.4;
      }

      .playground-project-overview-progress-legend-row:last-child {
        border-bottom: 0;
      }

      .playground-project-overview-progress-legend-name {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-progress-legend-percent {
        text-align: right;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-project-overview-progress-legend-count {
        text-align: right;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-project-overview-activity-card {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-project-overview-activity-card.is-main {
        gap: 12px;
      }

      .playground-project-overview-activity-card.is-main .playground-project-overview-activity-title {
        font-size: 14px;
        line-height: 1.35;
      }

      .playground-project-overview-activity-card.is-main .playground-project-overview-activity-list {
        gap: 0;
      }

      .playground-project-overview-activity-card.is-main .playground-project-overview-activity-row {
        grid-template-columns: 28px minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        min-height: 50px;
        padding: 8px 0;
        border-bottom: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-project-overview-activity-card.is-main .playground-project-overview-activity-row:not(:last-child)::after {
        display: block;
        left: 12px;
        top: 30px;
        bottom: -8px;
        width: 1px;
        background: rgba(255, 255, 255, 0.12);
      }

      .playground-project-overview-activity-card.is-main .playground-project-overview-activity-avatar {
        width: 24px;
        height: 24px;
      }

      .playground-project-overview-activity-card.is-main .playground-project-overview-activity-copy {
        padding: 0;
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-project-overview-activity-participants {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        flex: 0 0 auto;
        min-width: 0;
      }

      .playground-project-overview-activity-participant-avatar {
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
        border-radius: 999px;
        overflow: hidden;
        border: 2px solid #050505;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-activity-participant-avatar + .playground-project-overview-activity-participant-avatar {
        margin-left: -7px;
      }

      .playground-project-overview-activity-participant-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .playground-project-overview-activity-participant-avatar-fallback {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 10px;
        line-height: 1;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-project-overview-activity-show-more {
        position: relative;
        isolation: isolate;
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 30px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.86);
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        cursor: pointer;
      }

      .playground-project-overview-activity-show-more::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        padding: 1px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.04)),
          rgba(255, 255, 255, 0.06);
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }

      .playground-project-overview-activity-show-more:hover {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-activity-actions {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        margin-top: 4px;
      }

      .playground-project-overview-latest-update-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px 16px 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.02);
      }

      .playground-project-overview-latest-update-header,
      .playground-project-overview-latest-update-meta,
      .playground-project-overview-latest-update-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-project-overview-latest-update-header {
        justify-content: space-between;
        gap: 16px;
      }

      .playground-project-overview-latest-update-title {
        min-width: 0;
        margin: 0;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-project-overview-latest-update-button {
        flex: 0 0 auto;
        appearance: none;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.58);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        font: inherit;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
      }

      .playground-project-overview-latest-update-button:hover {
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-project-overview-latest-update-button-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
      }

      .playground-project-overview-latest-update-meta {
        flex-wrap: wrap;
        font-size: 12px;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-project-overview-latest-update-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgb(74, 222, 128);
      }

      .playground-project-overview-latest-update-status-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
        border-radius: 999px;
        color: rgb(74, 222, 128);
      }

      .playground-project-overview-latest-update-author {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        gap: 7px;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-project-overview-latest-update-author .playground-project-overview-sidebar-avatar,
      .playground-project-overview-latest-update-author .playground-project-overview-activity-avatar {
        width: 18px;
        height: 18px;
        font-size: 8px;
      }

      .playground-project-overview-latest-update-body {
        margin: 2px 0 0;
        white-space: pre-wrap;
        font-size: 13px;
        line-height: 1.55;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-latest-update-actions {
        gap: 8px;
        margin-top: 2px;
      }

      .playground-project-overview-latest-update-icon-button {
        width: 30px;
        height: 30px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
        color: rgba(255, 255, 255, 0.62);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
      }

      .playground-project-overview-latest-update-icon-button:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.07);
      }

      .playground-project-overview-latest-update-icon {
        width: 14px;
        height: 14px;
      }

      .playground-project-overview-activity-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-project-overview-activity-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.2;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-project-overview-activity-list {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-project-overview-activity-row {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr) auto;
        gap: 14px;
        align-items: center;
        position: relative;
        min-height: 54px;
      }

      .playground-project-overview-activity-row:not(:last-child)::after {
        content: "";
        position: absolute;
        left: 16px;
        top: 34px;
        bottom: 0;
        width: 1px;
        background: rgba(255, 255, 255, 0.12);
      }

      .playground-project-overview-activity-avatar {
        position: relative;
        z-index: 1;
        width: 32px;
        height: 32px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-project-overview-activity-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .playground-project-overview-activity-avatar-fallback {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-project-overview-activity-copy {
        min-width: 0;
        padding: 4px 0 18px;
        font-size: 13px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-project-overview-activity-actor {
        color: #fff;
        font-weight: 400;
      }

      .playground-project-overview-activity-object {
        color: rgba(255, 255, 255, 0.94);
        font-weight: 600;
      }

      .playground-project-overview-activity-object.is-clickable {
        appearance: none;
        border: 0;
        background: transparent;
        padding: 0;
        margin: 0;
        font: inherit;
        color: rgba(255, 255, 255, 0.94);
        font-weight: 400;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-activity-object.is-clickable:hover {
        color: #fff;
        text-decoration: underline;
        text-decoration-color: rgba(255, 255, 255, 0.45);
        text-underline-offset: 3px;
      }

      .playground-project-overview-activity-time {
        color: rgba(255, 255, 255, 0.44);
      }

      .playground-project-overview-activity-permission {
        position: relative;
        z-index: 4;
        justify-self: end;
        align-self: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-left: 8px;
        color: rgba(255, 255, 255, 0.8);
      }

      .playground-project-overview-activity-permission-tooltip {
        pointer-events: none;
        position: absolute;
        z-index: 140;
        right: 0;
        bottom: calc(100% + 8px);
        width: min(280px, 72vw);
        padding: 9px 10px;
        border-radius: 8px;
        background: rgba(32, 32, 34, 0.98);
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.34);
        color: rgba(255, 255, 255, 0.78);
        opacity: 0;
        visibility: hidden;
        transform: translateY(4px);
        transition: opacity 0.16s ease, transform 0.16s ease, visibility 0.16s ease;
      }

      .playground-project-overview-activity-permission:hover .playground-project-overview-activity-permission-tooltip,
      .playground-project-overview-activity-permission:focus-visible .playground-project-overview-activity-permission-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .playground-project-overview-activity-permission-tooltip-title {
        display: block;
        margin-bottom: 4px;
        color: rgba(255, 255, 255, 0.94);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.25;
        white-space: normal;
      }

      .playground-project-overview-activity-permission-tooltip-copy {
        display: block;
        color: rgba(255, 255, 255, 0.7);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.4;
        white-space: normal;
      }

      .playground-project-overview-activity-empty {
        padding: 18px 0;
        font-size: 13px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-project-overview-integration-facts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 24px;
        margin-top: 12px;
        padding: 0;
        border-top: 0;
      }

      .playground-project-overview-integration-row {
        grid-template-columns: minmax(0, 1fr) minmax(0, auto);
        width: 100%;
        min-width: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-project-overview-integration-row .playground-tasks-connector-service-label {
        color: #ffffff;
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

      .playground-project-overview-plugins-panel {
        width: 100%;
        margin-top: 18px;
      }

      .playground-project-overview-plugins-panel .playground-plugins-section-header {
        padding-bottom: 14px;
        border-bottom: 0;
      }

      .playground-project-overview-plugins-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        width: 100%;
        margin-top: 4px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-plugins-list .playground-project-overview-integration-row {
        min-height: 64px;
        padding: 14px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

      .playground-project-overview-chart-footer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 30px;
      }

      .playground-project-overview-chart-footer-row .playground-settings-usage-inline-legend {
        flex: 1 1 auto;
        min-width: 0;
        justify-content: flex-start;
      }

      .playground-project-overview-chart-footer-row .playground-environments-home-comparison-timescale-select {
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

      .playground-agents-overview-tabs.playground-project-overview-tabs {
        margin: 0 0 18px;
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
        margin-top: 0 !important;
      }

      .playground-project-permissions-section {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-project-permissions-section > .playground-permission-rings-overview {
        margin-bottom: 42px;
      }

      .playground-project-permissions-details-card {
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-project-permissions-details-card::before {
        content: none;
      }

      .playground-project-teams-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
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

      .playground-project-teams-add-shell.is-open {
        z-index: 380;
      }

      .playground-project-teams-add-menu,
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

      .playground-project-teams-table-shell .playground-project-team-action-shell.is-open .playground-project-team-action-menu,
      .playground-project-teams-add-shell.is-open .playground-project-teams-add-menu {
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
        border: 0;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.96);
        padding: 14px;
        min-height: 154px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;
        font: inherit;
        cursor: pointer;
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

export const PROJECT_OVERVIEW_SCRIPT = String.raw`
        function formatProjectOverviewCt(value) {
          const numericValue = Math.max(0, Number(value || 0));
          const dollars = Number.isFinite(numericValue) ? numericValue / 100 : 0;
          const smallValue = dollars > 0 && dollars < 0.01;
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: smallValue ? 4 : 2,
            maximumFractionDigits: smallValue ? 4 : 2,
          }).format(dollars);
        }

        function formatProjectOverviewAxisCt(value) {
          return formatProjectOverviewCt(value);
        }

        function formatProjectOverviewInteger(value) {
          const numericValue = Math.max(0, Number(value || 0));
          if (!Number.isFinite(numericValue) || numericValue <= 0) {
            return "0";
          }
          return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(numericValue));
        }

        function getProjectOverviewOutcomeReleaseIds(outcome) {
          if (typeof normalizePlaygroundStrategyOutcomeReleaseIds === "function") {
            return normalizePlaygroundStrategyOutcomeReleaseIds(outcome);
          }
          const next = [];
          const seen = new Set();
          const addReleaseId = (releaseId) => {
            const normalizedReleaseId = String(releaseId || "").trim();
            if (!normalizedReleaseId || seen.has(normalizedReleaseId)) {
              return;
            }
            seen.add(normalizedReleaseId);
            next.push(normalizedReleaseId);
          };
          const addReleaseIds = (releaseIds) => {
            if (Array.isArray(releaseIds)) {
              releaseIds.forEach(addReleaseId);
              return;
            }
            if (typeof releaseIds === "string") {
              releaseIds
                .replaceAll(String.fromCharCode(13), "")
                .split(new RegExp("[" + String.fromCharCode(10) + ",]+"))
                .forEach(addReleaseId);
            }
          };
          if (outcome && typeof outcome === "object" && !Array.isArray(outcome)) {
            addReleaseIds(outcome.releaseIds || outcome.release_ids || outcome.milestoneIds || outcome.milestone_ids);
            addReleaseId(outcome.releaseId || outcome.release_id || outcome.milestoneId || outcome.milestone_id);
          }
          return next;
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

        function getProjectOverviewOutcomeProgressRingValue(value) {
          const numericValue = Number(value || 0);
          if (!Number.isFinite(numericValue)) {
            return 0;
          }
          return Math.max(0, Math.min(100, numericValue));
        }

        function drawProjectOverviewOutcomeProgressRing(canvas, progressValue, ringId = "ring_1") {
          if (!canvas) {
            return;
          }
          const fallbackSize = typeof PLAYGROUND_PERMISSION_MINI_RING_ICON_SIZE === "number"
            ? PLAYGROUND_PERMISSION_MINI_RING_ICON_SIZE
            : 24;
          const fallbackLineWidthRatio = typeof PLAYGROUND_PERMISSION_MINI_RING_ICON_LINE_WIDTH === "number"
            ? PLAYGROUND_PERMISSION_MINI_RING_ICON_LINE_WIDTH / fallbackSize
            : 1 / 24;
          const fallbackPaddingRatio = typeof PLAYGROUND_PERMISSION_MINI_RING_ICON_PADDING === "number"
            ? PLAYGROUND_PERMISSION_MINI_RING_ICON_PADDING / fallbackSize
            : 2.9 / 24;
          const startAngle = typeof PLAYGROUND_PERMISSION_RING_CHART_START_ANGLE === "number"
            ? PLAYGROUND_PERMISSION_RING_CHART_START_ANGLE
            : -Math.PI / 2 - 0.18;
          const fullCapStartOffset = typeof PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_START_OFFSET === "number"
            ? PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_START_OFFSET
            : -0.18;
          const fullCapEndOffset = typeof PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_END_OFFSET === "number"
            ? PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_END_OFFSET
            : 0.32;
          const fullCapClipOffset = typeof PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_CLIP_OFFSET === "number"
            ? PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_CLIP_OFFSET
            : 0.14;
          const normalizedRingId = typeof normalizePlaygroundPermissionRingId === "function"
            ? normalizePlaygroundPermissionRingId(ringId, "ring_1")
            : "ring_1";
          const rawProgress = getProjectOverviewOutcomeProgressRingValue(progressValue) / 100;
          const progress = rawProgress > 0 ? rawProgress : 0.05;
          const rect = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.round(rect.width || fallbackSize));
          const height = Math.max(1, Math.round(rect.height || fallbackSize));
          const dpr = Math.max(1, window.devicePixelRatio || 1);
          const targetWidth = Math.round(width * dpr);
          const targetHeight = Math.round(height * dpr);
          if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
          }

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return;
          }

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);

          const size = Math.min(width, height);
          const centerX = width / 2;
          const centerY = height / 2;
          const lineWidth = Math.max(1, size * fallbackLineWidthRatio);
          const padding = Math.max(2, size * fallbackPaddingRatio);
          const radius = Math.max(1, size / 2 - lineWidth / 2 - padding);
          const miniRingGradients = typeof PLAYGROUND_PERMISSION_MINI_RING_ICON_GRADIENTS === "object"
            ? PLAYGROUND_PERMISSION_MINI_RING_ICON_GRADIENTS
            : undefined;
          const makeGradient = (alpha, gradientProgress = Math.max(progress, 0.001)) => {
            if (typeof createPlaygroundPermissionRingGradient === "function") {
              return createPlaygroundPermissionRingGradient(ctx, width, height, normalizedRingId, alpha, gradientProgress, miniRingGradients);
            }
            const gradient = ctx.createLinearGradient(width / 2, 0, width / 2, height);
            gradient.addColorStop(0, "rgba(31, 130, 72, " + alpha + ")");
            gradient.addColorStop(1, "rgba(29, 225, 163, " + alpha + ")");
            return gradient;
          };
          const getStartColor = (alpha = 1) => typeof getPlaygroundPermissionRingStartColor === "function"
            ? getPlaygroundPermissionRingStartColor(normalizedRingId, alpha)
            : "rgba(31, 130, 72, " + alpha + ")";
          const getEndColor = (alpha = 1) => typeof getPlaygroundPermissionRingEndColor === "function"
            ? getPlaygroundPermissionRingEndColor(normalizedRingId, alpha)
            : "rgba(29, 225, 163, " + alpha + ")";

          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = makeGradient(0.1, 1);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          if (progress <= 0) {
            return;
          }

          const endAngle = startAngle + Math.PI * 2 * Math.min(progress, 1);

          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = makeGradient(1, progress);
          ctx.lineCap = "butt";
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.stroke();
          ctx.restore();

          if (progress < 0.999) {
            const startCapX = centerX + Math.cos(startAngle) * radius;
            const startCapY = centerY + Math.sin(startAngle) * radius;
            const endCapX = centerX + Math.cos(endAngle) * radius;
            const endCapY = centerY + Math.sin(endAngle) * radius;

            ctx.save();
            ctx.fillStyle = getStartColor(1);
            ctx.beginPath();
            ctx.arc(startCapX, startCapY, lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = getEndColor(1);
            ctx.beginPath();
            ctx.arc(endCapX, endCapY, lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
          }

          const fullCapStartAngle = startAngle + fullCapStartOffset;
          const fullCapEndAngle = startAngle + fullCapEndOffset;
          const capClipAngle = startAngle + fullCapClipOffset;
          const capClipX = centerX + Math.cos(capClipAngle) * radius;

          ctx.save();
          ctx.beginPath();
          ctx.rect(capClipX + lineWidth * 0.08, 0, width - capClipX, height);
          ctx.clip();
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.strokeStyle = getEndColor(1);
          ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
          ctx.shadowBlur = Math.max(3, lineWidth * 0.8);
          ctx.shadowOffsetX = Math.max(1, lineWidth * 0.24);
          ctx.shadowOffsetY = Math.max(0.5, lineWidth * 0.14);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, fullCapStartAngle, fullCapEndAngle);
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.strokeStyle = getEndColor(1);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, fullCapStartAngle, fullCapEndAngle);
          ctx.stroke();
          ctx.restore();
        }

        function PlaygroundProjectOverviewOutcomeProgressRing({ progress, label } = {}) {
          const normalizedProgress = getProjectOverviewOutcomeProgressRingValue(progress);
          const canvasRef = useRef(null);
          const iconColor = typeof getPlaygroundPermissionRingIconColor === "function"
            ? getPlaygroundPermissionRingIconColor("ring_1", 1)
            : "rgba(29, 225, 163, 1)";

          useEffect(() => {
            const redraw = () => drawProjectOverviewOutcomeProgressRing(canvasRef.current, normalizedProgress, "ring_1");
            redraw();
            window.addEventListener("resize", redraw);
            return () => window.removeEventListener("resize", redraw);
          }, [normalizedProgress]);

          return React.createElement("span", {
              className: "playground-project-overview-outcome-progress-ring"
                + (normalizedProgress >= 100 ? " is-complete" : normalizedProgress > 0 ? " is-active" : " is-empty"),
              role: "img",
              "aria-label": label || ("Outcome progress " + Math.round(normalizedProgress) + "%"),
              style: {
                "--permission-mini-ring-icon-color": iconColor,
              },
            },
            React.createElement("canvas", {
              ref: canvasRef,
              className: "playground-project-overview-outcome-progress-ring-canvas",
            }),
            React.createElement(Award, { strokeWidth: 2.35 })
          );
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
          if (!totals.some((value) => value > 0)) {
            return config?.emptyContent || React.createElement("div", { className: "playground-project-overview-chart-empty" }, config?.emptyText || "No usage data in this period");
          }
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
              ariaLabel: config?.ariaLabel || "Project cost chart",
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

        function renderProjectOverviewCostEmptyState() {
          return React.createElement("div", {
            className: "playground-project-overview-chart-empty playground-auth-users-empty-state playground-configure-usage-empty-state",
          },
            React.createElement("img", {
              className: "playground-auth-users-empty-state-image",
              src: "/img/empty-state/no-agent-usage.avif",
              alt: "",
              "aria-hidden": "true",
              draggable: "false",
            }),
            React.createElement("div", { className: "playground-auth-users-empty-state-title" }, "No Project Cost yet"),
            React.createElement("div", { className: "playground-auth-users-empty-state-copy" },
              "Project costs will appear here once agents, computers, or connected resources consume credits."
            )
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
          const projectOverviewGoal = String(projectOverviewDraft?.description || "");
          const projectThreads = Array.isArray(projectOverviewThreads) ? projectOverviewThreads : [];
          const normalizedOverviewTasks = Array.isArray(tasks)
            ? tasks.map((task) => normalizePlaygroundTaskRecord(task))
            : [];
          const normalizedOverviewTasksById = normalizedOverviewTasks.reduce((acc, task) => {
            const taskId = String(task?.id || "").trim();
            if (taskId) {
              acc[taskId] = task;
            }
            return acc;
          }, Object.create(null));
          const missionControlSummaryText = String(selectedProjectMissionControl.summary || "").trim()
            || (String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim()
              ? "Mission Control has generated a strategy snapshot for the current project state."
              : "Run Mission Control to generate the first strategy statement and backlog recommendations for this project.");
          const hasStrategyDocument = Boolean(String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim());
          const canUndoMissionControlDocument = Array.isArray(missionControlDocumentHistory?.past) && missionControlDocumentHistory.past.length > 0;
          const canRedoMissionControlDocument = Array.isArray(missionControlDocumentHistory?.future) && missionControlDocumentHistory.future.length > 0;
          const renderMissionControlDocumentToolbarButton = (action) =>
            React.createElement("button", {
              key: action.id,
              type: "button",
              className: "playground-tasks-detail-format-button",
              title: action.label,
              "aria-label": action.label,
              disabled: Boolean(action.disabled),
              onMouseDown: (event) => event.preventDefault(),
              onClick: action.onClick,
            }, React.createElement(action.icon, {
              width: 14,
              height: 14,
              strokeWidth: action.strokeWidth || 1.8,
            }));
          const missionControlDocumentTextFormatActions = [
            { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
            { id: "italic", label: "Italic", icon: Italic },
            { id: "underline", label: "Underline", icon: Underline },
          ];
          const missionControlDocumentListFormatActions = [
            { id: "list", label: "List", icon: List },
            { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
          ];
          const missionControlDocumentInsertFormatActions = [
            { id: "code", label: "Code", icon: CodeXml },
            { id: "link", label: "Link", icon: Link2 },
          ];
          const normalizedProjectOverviewHomeTab = projectOverviewHomeTab === "rules" ? "strategy" : projectOverviewHomeTab;
          const projectOverviewSettingsMetadata = projectOverviewDraft?.metadata && typeof projectOverviewDraft.metadata === "object" && !Array.isArray(projectOverviewDraft.metadata)
            ? projectOverviewDraft.metadata
            : {};
          const selectedProjectSettingsMetadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
            ? selectedProject.metadata
            : {};
	          const projectOverviewAccessLevel = String(
	            projectOverviewDraft?.teamAccessLevel
	            || selectedProject?.teamAccessLevel
	            || projectOverviewSettingsMetadata.teamAccessLevel
	            || selectedProjectSettingsMetadata.teamAccessLevel
	            || ""
	          ).trim().toLowerCase();
          const projectOverviewSharedTeamId = String(
            projectOverviewDraft?.teamId
            || selectedProject?.teamId
            || projectOverviewSettingsMetadata.teamId
            || selectedProjectSettingsMetadata.teamId
            || ""
          ).trim();
          const projectOverviewSharedWorkspaceTeam = projectOverviewSharedTeamId && Array.isArray(workspaceTeams)
            ? workspaceTeams.find((team) => String(team?.id || "").trim() === projectOverviewSharedTeamId) || null
            : null;
          const normalizedWorkspaceTeamMembersTeamId = String(workspaceTeamMembersTeamId || "").trim();
          const projectOverviewSharedTeamMemberRows = projectOverviewSharedTeamId
            && normalizedWorkspaceTeamMembersTeamId === projectOverviewSharedTeamId
            && Array.isArray(workspaceTeamMembers)
              ? workspaceTeamMembers
              : [];
          const projectOverviewSharedTeamName = String(
            projectOverviewDraft?.teamName
            || selectedProject?.teamName
            || projectOverviewSettingsMetadata.teamName
            || selectedProjectSettingsMetadata.teamName
            || projectOverviewSharedWorkspaceTeam?.name
            || ""
          ).trim();
          const projectOverviewViewerProjectRoleId = (() => {
            const explicitRole = String(
              projectOverviewDraft?.teamRoleId
              || projectOverviewDraft?.teamRole
              || projectOverviewDraft?.projectRoleId
              || projectOverviewDraft?.projectRole
              || selectedProject?.teamRoleId
              || selectedProject?.teamRole
              || selectedProject?.projectRoleId
              || selectedProject?.projectRole
              || projectOverviewSettingsMetadata.teamRoleId
              || projectOverviewSettingsMetadata.teamRole
              || projectOverviewSettingsMetadata.projectRoleId
              || projectOverviewSettingsMetadata.projectRole
              || selectedProjectSettingsMetadata.teamRoleId
              || selectedProjectSettingsMetadata.teamRole
              || selectedProjectSettingsMetadata.projectRoleId
              || selectedProjectSettingsMetadata.projectRole
              || ""
            ).trim();
            if (explicitRole) {
              return normalizePlaygroundTeamRoleId(explicitRole, "");
            }
            const sharedTeamRole = String(
              projectOverviewSharedWorkspaceTeam?.projectRoleId
              || projectOverviewSharedWorkspaceTeam?.projectRole
              || projectOverviewSharedWorkspaceTeam?.teamRoleId
              || projectOverviewSharedWorkspaceTeam?.teamRole
              || projectOverviewSharedWorkspaceTeam?.role
              || ""
            ).trim();
            if (sharedTeamRole) {
              return normalizePlaygroundTeamRoleId(sharedTeamRole, "");
            }
            if (
              projectOverviewAccessLevel === "edit"
              || projectOverviewAccessLevel === "write"
              || projectOverviewAccessLevel === "contributor"
              || projectOverviewAccessLevel === "develop"
              || projectOverviewAccessLevel === "configure"
            ) {
              return "contributor";
            }
            if (
              projectOverviewAccessLevel === "use"
              || projectOverviewAccessLevel === "read"
              || projectOverviewAccessLevel === "read_only"
              || projectOverviewAccessLevel === "viewer"
              || projectOverviewAccessLevel === "view"
              || projectOverviewAccessLevel === "member"
              || projectOverviewAccessLevel === "create"
            ) {
              return "member";
            }
            return "";
          })();
	          const hasReducedProjectRole = projectOverviewViewerProjectRoleId === "contributor" || projectOverviewViewerProjectRoleId === "member";
          const isCurrentViewerProjectOwner = Boolean(isProjectCreatedByCurrentViewer?.(projectOverviewDraft || selectedProject));
	          const canManageProjectAccess = Boolean(
	            (!hasReducedProjectRole && isCurrentViewerProjectOwner)
	            || (!hasReducedProjectRole && (projectOverviewViewerProjectRoleId === "owner" || projectOverviewViewerProjectRoleId === "admin" || projectOverviewAccessLevel === "owner" || projectOverviewAccessLevel === "manage"))
	          );
          const hasReducedProjectSettingsAccess = Boolean(!canManageProjectAccess && hasReducedProjectRole);
          const canViewProjectSettings = canManageProjectAccess || hasReducedProjectSettingsAccess;
	          const activeProjectOverviewHomeTab = normalizedProjectOverviewHomeTab === "resources" || normalizedProjectOverviewHomeTab === "strategy" || (canViewProjectSettings && normalizedProjectOverviewHomeTab === "permissions")
		            ? normalizedProjectOverviewHomeTab
		            : "general";
          function restoreProjectOverviewSidebarAfterPermissionClose() {
            if (!projectOverviewSidebarAutoCollapsedForPermissionRef.current) {
              return;
            }
            projectOverviewSidebarAutoCollapsedForPermissionRef.current = false;
            setProjectOverviewSidebarCollapsed(false);
          }
          function closeProjectOverviewPermissionDetail(options = {}) {
            if (typeof setProjectOverviewPermissionTeamId === "function") {
              setProjectOverviewPermissionTeamId("");
            }
            if (typeof setProjectOverviewPermissionRoleId === "function") {
              setProjectOverviewPermissionRoleId("member");
            }
            if (options.restoreSidebar !== false) {
              restoreProjectOverviewSidebarAfterPermissionClose();
            }
          }
	          function openProjectOverviewPermissionDetail(team, roleId = "member") {
	            if (!canManageProjectAccess) {
	              return;
	            }
	            const teamId = String(team?.id || "").trim();
	            if (!teamId) {
	              return;
	            }
            if (typeof setProjectOverviewPermissionRoleId === "function") {
              setProjectOverviewPermissionRoleId(normalizePlaygroundTeamRoleId(roleId, "member"));
            }
            if (typeof setProjectOverviewPermissionTeamId === "function") {
              setProjectOverviewPermissionTeamId(teamId);
            }
            const shouldAutoCollapseSidebar = teamId !== "all_agents" && !projectOverviewSidebarCollapsed;
            if (shouldAutoCollapseSidebar) {
              projectOverviewSidebarAutoCollapsedForPermissionRef.current = true;
              setProjectOverviewSidebarCollapsed(true);
            } else if (teamId !== "all_agents") {
              projectOverviewSidebarAutoCollapsedForPermissionRef.current = false;
            }
          }
	          function renderProjectOverviewHomeTabs() {
	            const tabs = [
		              { id: "general", label: "General" },
		              { id: "resources", label: "Resources" },
			              { id: "strategy", label: "Strategy" },
			              canViewProjectSettings ? { id: "permissions", label: "Settings" } : null,
			            ].filter(Boolean);
            return React.createElement("div", { className: "playground-agents-overview-tabs playground-project-overview-tabs" },
              React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                tabs.map((tab) =>
                  React.createElement("button", {
                    key: tab.id,
                    type: "button",
                    className: "playground-project-overview-chart-tab" + (activeProjectOverviewHomeTab === tab.id ? " is-active" : ""),
                    onClick: () => {
                      if (typeof setProjectOverviewHomeTab === "function") {
                        setProjectOverviewHomeTab(tab.id);
                      }
                      if (typeof setProjectOverviewTaskToolbarPopover === "function") {
                        setProjectOverviewTaskToolbarPopover("");
                      }
                      if (typeof setProjectOverviewThreadToolbarPopover === "function") {
                        setProjectOverviewThreadToolbarPopover("");
                      }
                      if (typeof setProjectOverviewFileToolbarPopover === "function") {
                        setProjectOverviewFileToolbarPopover("");
                      }
                      if (typeof setProjectOverviewResourceToolbarPopover === "function") {
                        setProjectOverviewResourceToolbarPopover("");
                      }
                      if (typeof setProjectOverviewFilesSubview === "function") {
                        setProjectOverviewFilesSubview("overview");
                      }
                      closeProjectOverviewPermissionDetail();
                      if (tab.id === "permissions" && typeof requestProjectOverviewWorkspaceTeams === "function") {
                        requestProjectOverviewWorkspaceTeams();
                      }
                      if (tab.id === "strategy") {
                        if (typeof setMissionControlSetupOpen === "function") {
                          setMissionControlSetupOpen(false);
                        }
                        if (typeof setSelectedTaskId === "function") {
                          setSelectedTaskId("");
                        }
                        if (typeof setDraftTask === "function") {
                          setDraftTask(null);
                        }
                        if (typeof setMissionControlStrategyOpen === "function") {
                          setMissionControlStrategyOpen(false);
                        }
                      }
                    },
                    "aria-pressed": activeProjectOverviewHomeTab === tab.id ? "true" : "false",
                  }, tab.label)
                )
              )
            );
          }

          const projectOverviewTimescaleConfig = (() => {
            if (projectOverviewChartTimescale === "day") {
              return {
                key: "day",
                title: "Daily Cost by Resource Type",
                bucketCount: 14,
                unit: "day",
              };
            }
            if (projectOverviewChartTimescale === "week") {
              return {
                key: "week",
                title: "Weekly Cost by Resource Type",
                bucketCount: 8,
                unit: "week",
              };
            }
            return {
              key: "month",
              title: "Monthly Cost by Resource Type",
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

            const projectCostSummary = projectOverviewCostSummaryState?.summary;
            const projectCostSummaryDays = Array.isArray(projectCostSummary?.byDay) ? projectCostSummary.byDay : [];
            if (projectOverviewCostSummaryState?.status === "ready" && projectCostSummary) {
              projectCostSummaryDays.forEach((day) => {
                const timestamp = Date.parse(String(day?.date || "") + "T00:00:00");
                if (!Number.isFinite(timestamp)) {
                  return;
                }
                const dayDate = new Date(timestamp);
                let bucketKey = "";
                if (projectOverviewTimescaleConfig.unit === "day") {
                  bucketKey = getProjectOverviewLocalDayKey(dayDate);
                } else if (projectOverviewTimescaleConfig.unit === "week") {
                  bucketKey = getProjectOverviewLocalWeekStartKey(dayDate);
                } else {
                  bucketKey = getProjectOverviewLocalMonthStartKey(dayDate);
                }
                const bucketIndex = bucketIndexByKey.get(bucketKey);
                if (typeof bucketIndex !== "number") {
                  return;
                }
                const totalCT = Math.max(0, Number(readSettingsComputeTokens(day, "totalCT", "totalCost") || 0));
                const aiCT = Math.max(0, Number(readSettingsComputeTokens(day, "agentCT", "agentCost") || 0));
                const runtimeCT = Math.max(0, Number(readSettingsComputeTokens(day, "environmentCT", "environmentCost") || 0));
                const otherCT = Math.max(0, totalCT - aiCT - runtimeCT);
                buckets[bucketIndex].totalCT += totalCT;
                buckets[bucketIndex].aiCT += aiCT;
                buckets[bucketIndex].runtimeCT += runtimeCT;
                buckets[bucketIndex].otherCT += otherCT;
              });
              return buckets;
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
          const projectHasCostData = projectThreadTimeline.some((bucket) => bucket.totalCT > 0);
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
          const projectOverviewResourceTemplates = Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_DATA)
            ? PLAYGROUND_RESOURCE_TEMPLATE_DATA
            : [];
          const projectOverviewResourceTemplateTypes = Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_TYPE_DATA)
            ? PLAYGROUND_RESOURCE_TEMPLATE_TYPE_DATA
            : [];
          const projectOverviewMetadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
            ? selectedProject.metadata
            : {};
          const projectOverviewPublishedTemplates = Array.isArray(projectOverviewMetadata.resourceTemplates)
            ? projectOverviewMetadata.resourceTemplates
            : [];

          function getProjectOverviewCurrentProjectTypeId() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const candidates = [
              selectedProject?.projectType,
              selectedProject?.type,
              metadata.projectType,
              metadata.projectTypeId,
              metadata.operatingProfile,
            ];
            for (const value of candidates) {
              const normalized = String(value || "").trim().toLowerCase().replace(/_/g, "-");
              if (normalized) {
                return normalized;
              }
            }
            return "blank";
          }

          const currentProjectTypeId = getProjectOverviewCurrentProjectTypeId();
          const projectOverviewRecommendedTemplates = (() => {
            const normalizeProjectTypes = (template) => Array.isArray(template?.projectTypes)
              ? template.projectTypes.map((value) => String(value || "").trim().toLowerCase().replace(/_/g, "-")).filter(Boolean)
              : [];
            const matching = projectOverviewResourceTemplates.filter((template) => normalizeProjectTypes(template).includes(currentProjectTypeId));
            const fallback = projectOverviewResourceTemplates.filter((template) => {
              const projectTypes = normalizeProjectTypes(template);
              return !projectTypes.length || projectTypes.includes("blank");
            });
            const seen = new Set();
            return [...matching, ...fallback, ...projectOverviewResourceTemplates]
              .filter((template) => {
                const id = String(template?.id || "").trim();
                if (!id || seen.has(id)) {
                  return false;
                }
                seen.add(id);
                return true;
              })
              .slice(0, 3);
          })();

          const projectOverviewResourceTypeFilters = (() => {
            const fallbackTypes = [
              { id: "all", label: "All" },
              { id: "file", label: "Files" },
              { id: "metronome", label: "Metronomes" },
              { id: "web_app", label: "Web Apps" },
              { id: "function", label: "Functions" },
              { id: "database", label: "Databases" },
              { id: "imagine", label: "Imagine" },
            ];
            const base = projectOverviewResourceTemplateTypes.length ? projectOverviewResourceTemplateTypes : fallbackTypes;
            const wanted = new Set(["all", "file", "metronome", "web_app", "function", "database", "imagine"]);
            const seen = new Set();
            return base
              .filter((type) => wanted.has(String(type?.id || "").trim()))
              .filter((type) => {
                const id = String(type?.id || "").trim();
                if (!id || seen.has(id)) {
                  return false;
                }
                seen.add(id);
                return true;
              });
          })();

          function getProjectOverviewResourceTemplateIcon(type) {
            if (typeof getPlaygroundResourceTemplateIcon === "function") {
              return getPlaygroundResourceTemplateIcon(type);
            }
            const normalized = String(type || "").trim();
            if (normalized === "metronome") return Metronome;
            if (normalized === "web_app") return Monitor;
            if (normalized === "function") return FunctionSquare;
            if (normalized === "database") return Database;
            if (normalized === "imagine") return Clapperboard;
            return FileText;
          }

          function getProjectOverviewResourceTypeMeta(type) {
            const normalized = String(type || "").trim();
            const metaByType = {
              file: { label: "File", Icon: FileText, subview: "overview" },
              metronome: { label: "Metronome", Icon: Metronome, subview: "resources" },
              web_app: { label: "Web App", Icon: Monitor, subview: "web-apps" },
              function: { label: "Function", Icon: FunctionSquare, subview: "functions" },
              database: { label: "Database", Icon: Database, subview: "databases" },
              imagine: { label: "Imagine", Icon: Clapperboard, subview: "imagine" },
            };
            return metaByType[normalized] || { label: "Resource", Icon: Layers, subview: "resources" };
          }

          function classifyProjectOverviewServerResource(item) {
            if (isProjectOverviewMetronomeResource(item)) return "metronome";
            if (isProjectOverviewWebAppResource(item)) return "web_app";
            if (isProjectOverviewFunctionResource(item)) return "function";
            if (isProjectOverviewDatabaseResource(item)) return "database";
            return "resource";
          }

          function classifyProjectOverviewFileResource(item) {
            const candidate = [
              item?.mimeType,
              item?.contentType,
              item?.type,
              item?.fileType,
              item?.path,
              item?.sourcePath,
              item?.workspacePath,
              item?.title,
              item?.filename,
            ].join(" ");
            const normalizedCandidate = String(candidate || "").trim();
            if (/^image\//i.test(normalizedCandidate) || /^video\//i.test(normalizedCandidate) || /\.(avif|bmp|gif|jpe?g|png|svg|webp|m4v|mkv|mov|mp4|webm)$/i.test(normalizedCandidate)) {
              return "imagine";
            }
            return "file";
          }

          const projectOverviewAllResourceRows = (() => {
            const seen = new Set();
            const rows = [];
            function pushResourceRow(row) {
              const key = String(row?.key || row?.id || row?.path || row?.title || "").trim();
              if (!key || seen.has(key)) {
                return;
              }
              seen.add(key);
              rows.push(row);
            }
            projectOverviewPublishedTemplates.forEach((item, index) => {
              const normalizedTemplateId = String(item?.templateId || item?.id || "").trim();
              const catalogTemplate = projectOverviewResourceTemplates.find((template) => (
                String(template?.id || "").trim() === normalizedTemplateId
              ));
              const template = {
                ...(catalogTemplate && typeof catalogTemplate === "object" ? catalogTemplate : {}),
                ...(item && typeof item === "object" ? item : {}),
              };
              const type = String(template.type || "file").trim() || "file";
              pushResourceRow({
                key: "template:" + (normalizedTemplateId || type + ":" + index),
                kind: "template",
                type,
                title: String(template.title || "Published template").trim() || "Published template",
                subtitle: String(template.summary || template.description || "Published resource template").trim(),
                status: "Template",
                updatedLabel: getProjectOverviewSidebarDateLabel(template.publishedAt || ""),
                record: template,
                template,
                path: "",
              });
            });
            overviewProjectAttachments.forEach((attachment, index) => {
              const path = normalizeHistoryPath(attachment?.sourcePath || attachment?.workspacePath || attachment?.path || "");
              const title = String(attachment?.filename || getHistoryPathName(path) || attachment?.title || "Untitled file").trim();
              const type = classifyProjectOverviewFileResource(attachment);
              pushResourceRow({
                key: "attachment:" + (path || attachment?.id || index),
                kind: "attachment",
                type,
                title,
                subtitle: path || "Project attachment",
                status: "Attached",
                updatedLabel: getProjectOverviewSidebarDateLabel(attachment?.updatedAt || attachment?.createdAt || ""),
                record: attachment,
                path,
              });
            });
            (projectOverviewFileActivityState?.items || []).forEach((item, index) => {
              const path = normalizeHistoryPath(item?.path || item?.sourcePath || item?.workspacePath || "");
              const title = String(item?.title || item?.filename || getHistoryPathName(path) || "Untitled file").trim();
              const type = classifyProjectOverviewFileResource(item);
              pushResourceRow({
                key: "file:" + (path || item?.id || index),
                kind: "file",
                type,
                title,
                subtitle: path || "Workspace file",
                status: String(item?.operation || item?.operationKind || "Modified").trim() || "Modified",
                updatedLabel: item?.dateLabel || getProjectOverviewSidebarDateLabel(item?.updatedAt || item?.createdAt || ""),
                record: item,
                path,
              });
            });
            allOverviewResourceItems.forEach((item, index) => {
              const type = classifyProjectOverviewServerResource(item);
              const meta = getProjectOverviewResourceTypeMeta(type);
              const title = String(item?.name || item?.title || item?.label || item?.id || meta.label).trim();
              const subtitle = String(item?.description || item?.endpoint || item?.url || item?.id || "").trim();
              pushResourceRow({
                key: "resource:" + (item?.id || type + ":" + title + ":" + index),
                kind: "runtime",
                type,
                title,
                subtitle,
                status: String(item?.status || item?.state || "Linked").trim() || "Linked",
                updatedLabel: getProjectOverviewSidebarDateLabel(item?.updatedAt || item?.createdAt || ""),
                record: item,
                path: "",
              });
            });
            return rows.sort((left, right) => String(left.title || "").localeCompare(String(right.title || "")));
          })();
          const projectOverviewResourceRows = (() => {
            const filter = String(projectOverviewResourceFilter || "all").trim();
            const resourceSearch = String(projectOverviewResourceSearchQuery || "").trim().toLowerCase();
            return projectOverviewAllResourceRows
              .filter((row) => filter === "all" || row.type === filter)
              .filter((row) => {
                if (!resourceSearch) {
                  return true;
                }
                const creator = getProjectOverviewResourceCreator(row);
                return [row.title, row.subtitle, creator.name, creator.email, row.type].join(" ").toLowerCase().includes(resourceSearch);
              });
          })();

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
          function readProjectOverviewFileByteSize(record) {
            if (!record || typeof record !== "object") {
              return 0;
            }
            const candidateKeys = [
              "size",
              "bytes",
              "byteSize",
              "sizeBytes",
              "fileSize",
              "fileSizeBytes",
              "contentLength",
              "contentLengthBytes",
            ];
            for (const key of candidateKeys) {
              const value = Number(record[key]);
              if (Number.isFinite(value) && value > 0) {
                return value;
              }
            }
            const metadata = record.metadata || record.file || record.entry || record.resource || null;
            if (metadata && metadata !== record) {
              return readProjectOverviewFileByteSize(metadata);
            }
            return 0;
          }
          function readProjectOverviewStorageCapacityBytes(environment) {
            if (!environment || typeof environment !== "object") {
              return 0;
            }
            const bytesKeys = [
              "storageLimitBytes",
              "storageQuotaBytes",
              "storageCapacityBytes",
              "diskLimitBytes",
              "diskQuotaBytes",
              "diskCapacityBytes",
              "quotaBytes",
              "capacityBytes",
              "maxStorageBytes",
            ];
            for (const key of bytesKeys) {
              const value = Number(environment[key]);
              if (Number.isFinite(value) && value > 0) {
                return value;
              }
            }
            const mbKeys = [
              "storageLimitMB",
              "storageQuotaMB",
              "storageCapacityMB",
              "diskLimitMB",
              "diskQuotaMB",
              "diskCapacityMB",
              "quotaMB",
              "capacityMB",
              "maxStorageMB",
            ];
            for (const key of mbKeys) {
              const value = Number(environment[key]);
              if (Number.isFinite(value) && value > 0) {
                return value * 1024 * 1024;
              }
            }
            const gbKeys = [
              "storageLimitGB",
              "storageQuotaGB",
              "storageCapacityGB",
              "diskLimitGB",
              "diskQuotaGB",
              "diskCapacityGB",
              "quotaGB",
              "capacityGB",
              "maxStorageGB",
            ];
            for (const key of gbKeys) {
              const value = Number(environment[key]);
              if (Number.isFinite(value) && value > 0) {
                return value * 1024 * 1024 * 1024;
              }
            }
            const metadata = environment.metadata || environment.resource || environment.details || null;
            if (metadata && metadata !== environment) {
              return readProjectOverviewStorageCapacityBytes(metadata);
            }
            return 0;
          }
          const projectOverviewStorageUsedBytes = (() => {
            const seen = new Set();
            let total = 0;
            function addRecord(record, fallbackKey) {
              const key = String(
                record?.path
                || record?.sourcePath
                || record?.workspacePath
                || record?.filename
                || record?.title
                || record?.id
                || fallbackKey
                || ""
              ).trim();
              if (key && seen.has(key)) {
                return;
              }
              if (key) {
                seen.add(key);
              }
              total += readProjectOverviewFileByteSize(record);
            }
            (projectOverviewFileActivityState?.items || []).forEach((item, index) => addRecord(item, "activity:" + index));
            overviewProjectAttachments.forEach((attachment, index) => addRecord(attachment, "attachment:" + index));
            return total;
          })();
          const projectOverviewStorageCapacityBytes = Math.max(
            readProjectOverviewStorageCapacityBytes(activeProjectAttachmentEnvironment),
            projectOverviewStorageUsedBytes > 0 ? projectOverviewStorageUsedBytes * 4 : 0,
            1024 * 1024 * 1024
          );
          const projectOverviewStoragePercent = projectOverviewStorageCapacityBytes > 0
            ? Math.max(0, Math.min(100, Math.round((projectOverviewStorageUsedBytes / projectOverviewStorageCapacityBytes) * 1000) / 10))
            : 0;
          const projectOverviewFilesSubviewId = ["overview", "resources", "web-apps", "functions", "databases", "imagine"].includes(String(projectOverviewFilesSubview || ""))
            ? String(projectOverviewFilesSubview || "")
            : "overview";
          const isProjectOverviewResourceSubviewOpen = projectOverviewFilesSubviewId !== "overview";
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
            (Array.isArray(releases) ? releases : []).forEach((release) => {
              const releaseId = String(release?.id || "").trim();
              if (!releaseId || sectionIndexByKey.has(releaseId)) {
                return;
              }
              sectionIndexByKey.set(releaseId, sections.length);
              sections.push({
                key: releaseId,
                releaseId,
                title: release.name || "Untitled Milestone",
                tasks: [],
              });
            });
            normalizedOverviewTasks.forEach((task) => {
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
                  title: normalizedReleaseId ? (releaseRecord?.name || "Milestone unavailable") : "All other",
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
          const visibleProjectThreadIds = visibleProjectThreads
            .map((thread) => {
              const safeThread = typeof normalizeThreadItem === "function" ? normalizeThreadItem(thread) : thread;
              return String(safeThread?.id || thread?.id || "").trim();
            })
            .filter(Boolean);
          const selectedVisibleProjectThreadIds = visibleProjectThreadIds.filter((threadId) =>
            selectedProjectOverviewThreadIds instanceof Set && selectedProjectOverviewThreadIds.has(threadId)
          );
          const allVisibleProjectThreadsSelected = visibleProjectThreadIds.length > 0 && selectedVisibleProjectThreadIds.length === visibleProjectThreadIds.length;
          const hasPartialVisibleProjectThreadSelection = selectedVisibleProjectThreadIds.length > 0 && !allVisibleProjectThreadsSelected;
          const toggleProjectOverviewThreadSelection = (threadId) => {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || typeof setSelectedProjectOverviewThreadIds !== "function") {
              return;
            }
            setSelectedProjectOverviewThreadIds((current) => {
              const next = new Set(current || []);
              if (next.has(normalizedThreadId)) {
                next.delete(normalizedThreadId);
              } else {
                next.add(normalizedThreadId);
              }
              return next;
            });
          };
          const toggleVisibleProjectOverviewThreadSelection = () => {
            if (!visibleProjectThreadIds.length || typeof setSelectedProjectOverviewThreadIds !== "function") {
              return;
            }
            setSelectedProjectOverviewThreadIds((current) => {
              const next = new Set(current || []);
              if (allVisibleProjectThreadsSelected) {
                visibleProjectThreadIds.forEach((threadId) => next.delete(threadId));
              } else {
                visibleProjectThreadIds.forEach((threadId) => next.add(threadId));
              }
              return next;
            });
          };
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
          const projectOverviewImagineResources = (() => {
            const seen = new Set();
            const imageExtensions = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;
            const videoExtensions = /\.(m4v|mkv|mov|mp4|webm)$/i;
            return (projectOverviewFileActivityState?.items || [])
              .filter((item) => {
                const candidate = [
                  item?.mimeType,
                  item?.contentType,
                  item?.type,
                  item?.fileType,
                  item?.path,
                  item?.title,
                  item?.filename,
                ].join(" ");
                const normalizedCandidate = String(candidate || "").trim();
                return /^image\//i.test(normalizedCandidate)
                  || /^video\//i.test(normalizedCandidate)
                  || imageExtensions.test(normalizedCandidate)
                  || videoExtensions.test(normalizedCandidate);
              })
              .filter((item) => {
                const key = String(item?.path || item?.title || item?.id || "").trim();
                if (!key) {
                  return false;
                }
                if (seen.has(key)) {
                  return false;
                }
                seen.add(key);
                return true;
              })
              .sort((left, right) => {
                const leftTimestamp = Number(left?.timestamp || 0);
                const rightTimestamp = Number(right?.timestamp || 0);
                return (Number.isFinite(rightTimestamp) ? rightTimestamp : 0) - (Number.isFinite(leftTimestamp) ? leftTimestamp : 0);
              });
          })();
          const projectOverviewKpis = [
            {
              id: "tasks",
              value: String(Number(selectedProjectSummary.tasksCount) || Number(selectedProjectTaskStatusOverview.total) || 0),
              label: "All Tasks",
            },
            {
              id: "open",
              value: String(Number(selectedProjectSummary.openTasksCount) || 0),
              label: "Open Tasks",
            },
            {
              id: "ct",
              value: formatProjectOverviewCt(projectTotalCt),
              label: "Spent on Project",
            },
            {
              id: "resources",
              value: String(allOverviewResourceItems.length),
              label: "Project Resources",
            },
            {
              id: "files",
              value: String(allOverviewProjectFileCount),
              label: "Project Files",
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
                projectRecord: selectedProject,
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

          function renderProjectOverviewPluginsPanel() {
            const hasProjectPlugins = projectOverviewIntegrationRows.length > 0;
            return React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-plugins-panel",
              },
              renderOverviewSectionHeader(
                "Project Plugins",
                "Connect project-scoped plugin access so agents can read and write the right repositories, drives, and workspaces while they work."
              ),
              hasProjectPlugins
                ? React.createElement("div", { className: "playground-project-overview-plugins-list" },
                    projectOverviewIntegrationRows.map((row) => renderProjectOverviewIntegrationRow(row))
                  )
                : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    "No plugins are available yet."
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

          function renderProjectOverviewFilesToolbar() {
            return React.createElement("div", { className: "playground-plugins-search-row", ref: projectOverviewFilesToolbarRef },
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
                React.createElement("span", null, "Open Files")
              )
            );
          }

          function renderProjectOverviewFilesActivityPanel() {
            return React.createElement(React.Fragment, null,
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
                : null
            );
          }

          function renderProjectOverviewAttachmentsPanel() {
            return React.createElement("div", { className: "playground-tasks-attachments" },
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
            );
          }

          function renderProjectOverviewServerResourcesPanel(resourceItems = overviewResourceItems, emptyLabel = "No project resources have been created yet.") {
            const visibleResourceItems = Array.isArray(resourceItems) ? resourceItems : [];
            return React.createElement("div", { className: "playground-project-overview-resources-block" },
              React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Server Resources")
              ),
              projectOverviewServerResourcesState?.status === "loading"
                ? React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Loading project resources...")
                : projectOverviewServerResourcesState?.status === "error"
                  ? React.createElement("div", { className: "playground-tasks-secondary-copy" }, projectOverviewServerResourcesState.error || "Failed to load project resources.")
                  : visibleResourceItems.length > 0
                    ? React.createElement("div", { className: "playground-project-overview-resources-table" },
                        React.createElement("div", { className: "playground-project-overview-resources-table-header" },
                          React.createElement("div", null, "Title"),
                          React.createElement("div", null, "Endpoint"),
                          React.createElement("div", null, "Creator"),
                          React.createElement("div", null, "Date")
                        ),
                        visibleResourceItems.slice(0, 12).map((resource) => renderOverviewResourceRow(resource))
                      )
                    : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                        normalizedSearchQuery ? "No matching resources." : emptyLabel
                      )
            );
          }

          function renderProjectOverviewImagineResourceCard(resource) {
            const resourcePath = String(resource?.path || resource?.sourcePath || resource?.workspacePath || "").trim();
            const resourceTitle = String(resource?.title || resource?.filename || getHistoryPathName(resourcePath) || "Untitled visual").trim();
            const candidate = [resource?.mimeType, resource?.contentType, resource?.type, resource?.fileType, resourcePath, resourceTitle].join(" ");
            const isVideoResource = /^video\//i.test(String(candidate || "")) || /\.(m4v|mkv|mov|mp4|webm)$/i.test(String(candidate || ""));
            return React.createElement("button", {
                key: String(resource?.id || resourcePath || resourceTitle),
                type: "button",
                className: "playground-project-overview-imagine-card",
                onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(resource),
              },
              React.createElement("span", { className: "playground-project-overview-imagine-card-icon" },
                React.createElement(isVideoResource ? Film : ImageIcon, { width: 16, height: 16, strokeWidth: 1.8 })
              ),
              React.createElement("span", { className: "playground-project-overview-imagine-card-body" },
                React.createElement("span", { className: "playground-project-overview-imagine-card-title" }, resourceTitle),
                resourcePath
                  ? React.createElement("span", { className: "playground-project-overview-imagine-card-path" }, resourcePath)
                  : null,
                React.createElement("span", { className: "playground-project-overview-imagine-card-meta" },
                  [resource?.operation || "Created", resource?.dateLabel || ""].filter(Boolean).join(" · ")
                )
              )
            );
          }

          function renderProjectOverviewImagineResourcesPanel() {
            if (projectOverviewFileActivityState?.status === "loading") {
              return React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Loading imagine resources...");
            }
            if (projectOverviewFileActivityState?.status === "error") {
              return React.createElement("div", { className: "playground-environments-error" }, projectOverviewFileActivityState.error || "Failed to load imagine resources.");
            }
            if (projectOverviewImagineResources.length > 0) {
              return React.createElement("div", { className: "playground-project-overview-imagine-grid" },
                projectOverviewImagineResources.map((resource) => renderProjectOverviewImagineResourceCard(resource))
              );
            }
            return React.createElement("div", { className: "playground-project-overview-imagine-empty" },
              React.createElement(ImageIcon, { width: 22, height: 22, strokeWidth: 1.7 }),
              React.createElement("div", null, "No imagine resources yet."),
              React.createElement("div", null, "Images and visual assets created from this project will appear here.")
            );
          }

          function renderProjectOverviewFilesSubviewHeader(title, description) {
            return React.createElement("div", { className: "playground-project-overview-files-subview-header" },
              React.createElement("div", null,
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-files-subview-back",
                  onClick: () => typeof setProjectOverviewFilesSubview === "function" && setProjectOverviewFilesSubview("overview"),
                },
                  React.createElement(ChevronLeft, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Back to Resources")
                ),
                React.createElement("div", { className: "playground-project-overview-files-subview-title" }, title),
                description
                  ? React.createElement("div", { className: "playground-project-overview-files-subview-copy" }, description)
                  : null
              )
            );
          }

          function getProjectOverviewResourceSubviewInfo(subviewId) {
            const id = String(subviewId || "").trim();
            if (id === "web-apps") {
              return {
                title: "Web Apps",
                description: "Project web apps connected to this workspace.",
                emptyLabel: "No web apps have been created for this project yet.",
              };
            }
            if (id === "functions") {
              return {
                title: "Functions",
                description: "Project functions connected to this workspace.",
                emptyLabel: "No functions have been created for this project yet.",
              };
            }
            if (id === "databases") {
              return {
                title: "Databases",
                description: "Project databases connected to this workspace.",
                emptyLabel: "No databases have been created for this project yet.",
              };
            }
            return {
              title: "Server Resources",
              description: "Track the deployable resources connected to this project.",
              emptyLabel: "No project resources have been created yet.",
            };
          }

          function getProjectOverviewResourcesForSubview(subviewId) {
            const id = String(subviewId || "").trim();
            if (id === "web-apps") {
              return overviewResourceItems.filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewWebAppResource(item));
            }
            if (id === "functions") {
              return overviewResourceItems.filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewFunctionResource(item));
            }
            if (id === "databases") {
              return overviewResourceItems.filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewDatabaseResource(item));
            }
            return overviewResourceItems;
          }

          function renderProjectOverviewFilesConnectorBadge(row) {
            return React.createElement("span", {
                key: row.id || row.source || row.label,
                className: "playground-project-overview-files-connector-pill",
                title: row.label,
              },
              renderTaskConnectorServiceIcon(row.source, "playground-project-overview-files-connector-icon")
            );
          }

          function renderProjectOverviewFilesNavCard({ id, title, copy, Icon, onClick }) {
            return React.createElement("button", {
                key: id,
                type: "button",
                className: "playground-project-overview-files-nav-card",
                onClick: typeof onClick === "function"
                  ? onClick
                  : () => typeof setProjectOverviewFilesSubview === "function" && setProjectOverviewFilesSubview(id),
              },
              React.createElement("div", { className: "playground-project-overview-files-nav-card-icon" },
                React.createElement(Icon, { width: 17, height: 17, strokeWidth: 1.8 })
              ),
              React.createElement("div", { className: "playground-project-overview-files-nav-card-title" }, title),
              React.createElement("div", { className: "playground-project-overview-files-nav-card-copy" }, copy)
            );
          }

          function renderProjectOverviewFilesNavCards() {
            return React.createElement("div", { className: "playground-project-overview-files-card-grid" },
              renderProjectOverviewFilesNavCard({
                id: "files",
                title: "Files",
                copy: "Open project-scoped files, attachments, and generated artifacts.",
                Icon: FolderOpen,
                onClick: () => {
                  if (typeof onOpenFilesPage !== "function") return;
                  onOpenFilesPage({
                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    projectId: normalizedSelectedProjectId,
                    environmentId: activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                  });
                },
              }),
              renderProjectOverviewFilesNavCard({
                id: "metronomes",
                title: "Metronomes",
                copy: "Manage recurring project workflows and automated agent routines.",
                Icon: Metronome,
                onClick: () => {
                  if (typeof onOpenProjectMetronomes !== "function") return;
                  onOpenProjectMetronomes({
                    projectId: normalizedSelectedProjectId,
                  });
                },
              }),
              renderProjectOverviewFilesNavCard({
                id: "resources",
                title: "Server Resources",
                copy: "Inspect web apps, functions, databases, auth, and secrets.",
                Icon: Server,
                onClick: () => typeof setProjectOverviewFilesSubview === "function" && setProjectOverviewFilesSubview("resources"),
              }),
              renderProjectOverviewFilesNavCard({
                id: "imagine",
                title: "Imagine Resources",
                copy: "Review images and visual assets created in this project.",
                Icon: Clapperboard,
                onClick: () => typeof setProjectOverviewFilesSubview === "function" && setProjectOverviewFilesSubview("imagine"),
              })
            );
          }

          function renderProjectOverviewFilesTab() {
            if (projectOverviewFilesSubviewId === "overview") {
              return null;
            }
            if (projectOverviewFilesSubviewId === "resources") {
              const resourceSubviewInfo = getProjectOverviewResourceSubviewInfo(projectOverviewFilesSubviewId);
              return React.createElement("section", { className: "playground-tasks-project-panel playground-project-overview-files-section" },
                renderProjectOverviewFilesSubviewHeader(resourceSubviewInfo.title, resourceSubviewInfo.description),
                renderProjectOverviewServerResourcesPanel(getProjectOverviewResourcesForSubview(projectOverviewFilesSubviewId), resourceSubviewInfo.emptyLabel)
              );
            }
            if (projectOverviewFilesSubviewId === "web-apps" || projectOverviewFilesSubviewId === "functions" || projectOverviewFilesSubviewId === "databases") {
              const resourceSubviewInfo = getProjectOverviewResourceSubviewInfo(projectOverviewFilesSubviewId);
              return React.createElement("section", { className: "playground-tasks-project-panel playground-project-overview-files-section" },
                renderProjectOverviewFilesSubviewHeader(resourceSubviewInfo.title, resourceSubviewInfo.description),
                renderProjectOverviewServerResourcesPanel(getProjectOverviewResourcesForSubview(projectOverviewFilesSubviewId), resourceSubviewInfo.emptyLabel)
              );
            }
            if (projectOverviewFilesSubviewId === "imagine") {
              return React.createElement("section", { className: "playground-tasks-project-panel playground-project-overview-files-section" },
                renderProjectOverviewFilesSubviewHeader("Imagine Resources", "Visual resources created in the scope of this project."),
                renderProjectOverviewImagineResourcesPanel()
              );
            }
            return null;
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
            const isSubtask = typeof isPlaygroundSubtaskRecord === "function" ? isPlaygroundSubtaskRecord(task) : false;
            const TaskTypeIcon = isSubtask ? Check : Bookmark;
            const isLaunchLocked = typeof isTaskThreadLaunchLocked === "function" ? isTaskThreadLaunchLocked(task) : false;
            const isRunDisabled = Boolean(saveState?.isSaving) || isLaunchLocked;

            return React.createElement("div", {
                key: taskId || ticketNumber,
                className: "playground-tasks-backlog-item"
                  + (typeof isTaskPreviewStatusMenuOpen === "function" && isTaskPreviewStatusMenuOpen(taskId) ? " is-status-menu-open" : ""),
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
                  typeof renderTaskPreviewStatusControl === "function"
                    ? renderTaskPreviewStatusControl(task)
                    : null,
                  React.createElement("div", { className: "playground-tasks-backlog-assignee-shell" },
                    typeof renderTaskAssigneeAvatar === "function"
                      ? renderTaskAssigneeAvatar(task, "playground-tasks-backlog-assignee-avatar")
                      : null
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

          function getProjectOverviewThreadRecordObject(value) {
            return value && typeof value === "object" && !Array.isArray(value) ? value : {};
          }

          function getProjectOverviewThreadMetadataParts(thread) {
            const normalizedThread = getProjectOverviewThreadRecordObject(thread);
            const rawThread = getProjectOverviewThreadRecordObject(normalizedThread.rawThread);
            const metadata = getProjectOverviewThreadRecordObject(rawThread.metadata || normalizedThread.metadata);
            const runnerPlayground = getProjectOverviewThreadRecordObject(metadata.runnerPlayground);
            const runnerPlaygroundSnake = getProjectOverviewThreadRecordObject(metadata.runner_playground);
            const runner = Object.keys(runnerPlayground).length > 0 ? runnerPlayground : runnerPlaygroundSnake;
            const taskPreview = getProjectOverviewThreadRecordObject(runner.taskPreview || runner.task_preview);
            const missionControl = getProjectOverviewThreadRecordObject(runner.missionControl || runner.mission_control);
            const agentAssistant = getProjectOverviewThreadRecordObject(runner.agentAssistant || runner.agent_assistant);
            const metronome = getProjectOverviewThreadRecordObject(
              metadata.metronome
              || metadata.metronomeWorkflow
              || metadata.metronome_workflow
              || runner.metronome
              || runner.metronomeWorkflow
              || runner.metronome_workflow
            );
            const sourceRecord = getProjectOverviewThreadRecordObject(rawThread.source || metadata.source || runner.source);
            const triggerRecord = getProjectOverviewThreadRecordObject(rawThread.trigger || metadata.trigger || runner.trigger);
            return {
              rawThread,
              normalizedThread,
              metadata,
              runner,
              taskPreview,
              missionControl,
              agentAssistant,
              metronome,
              sourceRecord,
              triggerRecord,
            };
          }

          function readProjectOverviewThreadStringFromSources(sources, keys) {
            for (const source of sources) {
              if (!source || typeof source !== "object" || Array.isArray(source)) {
                continue;
              }
              for (const key of keys) {
                const value = source[key];
                if (typeof value === "string" && value.trim()) {
                  return value.trim();
                }
                if (typeof value === "number" && Number.isFinite(value)) {
                  return String(value);
                }
              }
            }
            return "";
          }

          function formatProjectOverviewThreadSourceLabel(value) {
            const rawValue = String(value || "").trim();
            const normalizedValue = rawValue.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
            if (!normalizedValue) {
              return "";
            }
            if (normalizedValue.includes("mission_control")) return "Mission Control";
            if (normalizedValue.includes("metronome") || normalizedValue.includes("workflow")) return "Metronome";
            if (normalizedValue.includes("email") || normalizedValue.includes("gmail") || normalizedValue === "mail" || normalizedValue.includes("inbox")) return "Email";
            if (normalizedValue.includes("slack")) return "Slack";
            if (normalizedValue.includes("discord")) return "Discord";
            if (normalizedValue.includes("telegram")) return "Telegram";
            if (normalizedValue.includes("webhook")) return "Webhook";
            if (normalizedValue.includes("api")) return "API";
            if (normalizedValue.includes("schedule") || normalizedValue.includes("cron")) return "Schedule";
            if (normalizedValue.includes("github")) return "GitHub";
            if (normalizedValue.includes("gitlab")) return "GitLab";
            if (
              normalizedValue.includes("chat")
              || normalizedValue.includes("thread")
              || normalizedValue.includes("assistant")
              || normalizedValue.includes("manual")
              || normalizedValue.includes("composer")
              || normalizedValue.includes("input")
              || normalizedValue.includes("sidebar")
              || normalizedValue.includes("private")
              || normalizedValue === "runner_web_sdk"
              || normalizedValue.includes("runner_web_sdk")
              || normalizedValue.includes("runner_web")
            ) {
              return "Chat";
            }
            return normalizedValue
              .split("_")
              .filter(Boolean)
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");
          }

          function getProjectOverviewThreadSourceLabel(thread) {
            const parts = getProjectOverviewThreadMetadataParts(thread);
            const sourceSources = [
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
              parts.taskPreview,
              parts.missionControl,
              parts.agentAssistant,
              parts.metronome,
              parts.sourceRecord,
              parts.triggerRecord,
            ];
            const metronomeCue = readProjectOverviewThreadStringFromSources(sourceSources, [
              "metronomeId",
              "metronome_id",
              "metronomeWorkflowId",
              "metronome_workflow_id",
              "workflowId",
              "workflow_id",
              "workflowRunId",
              "workflow_run_id",
            ]);
            if ((typeof getThreadMetronomeMetadata === "function" && getThreadMetronomeMetadata(thread)) || metronomeCue || Object.keys(parts.metronome).length > 0) {
              return "Metronome";
            }
            const explicitSource = readProjectOverviewThreadStringFromSources(sourceSources, [
              "source",
              "sourceType",
              "source_type",
              "triggerSource",
              "trigger_source",
              "trigger",
              "triggerType",
              "trigger_type",
              "origin",
              "originType",
              "origin_type",
              "channel",
              "channelType",
              "channel_type",
              "connector",
              "connectorType",
              "connector_type",
              "integration",
              "provider",
              "providerId",
              "provider_id",
              "resourceType",
              "resource_type",
              "runKind",
              "run_kind",
              "app",
              "appId",
              "app_id",
              "type",
              "kind",
            ]);
            return formatProjectOverviewThreadSourceLabel(explicitSource) || "Chat";
          }

          function getProjectOverviewThreadEnvironmentLabel(thread) {
            const parts = getProjectOverviewThreadMetadataParts(thread);
            const taskPreview = typeof getThreadTaskPreview === "function" ? (getThreadTaskPreview(thread) || parts.taskPreview) : parts.taskPreview;
            const missionControl = typeof getThreadMissionControlMetadata === "function" ? (getThreadMissionControlMetadata(thread) || parts.missionControl) : parts.missionControl;
            const projectRecord = getProjectOverviewThreadRecordObject(
              parts.rawThread.project
              || parts.metadata.project
              || parts.runner.project
              || taskPreview.project
              || missionControl.project
            );
            const environmentRecord = getProjectOverviewThreadRecordObject(
              parts.rawThread.environment
              || parts.rawThread.computer
              || parts.metadata.environment
              || parts.metadata.computer
              || parts.runner.environment
              || parts.runner.computer
              || taskPreview.environment
            );
            const projectName = readProjectOverviewThreadStringFromSources([projectRecord], [
              "projectName",
              "project_name",
              "displayName",
              "display_name",
              "name",
              "title",
            ]) || readProjectOverviewThreadStringFromSources([
              taskPreview,
              missionControl,
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
            ], [
              "projectName",
              "project_name",
            ]);
            if (projectName) {
              return projectName;
            }
            const environmentId = readProjectOverviewThreadStringFromSources([environmentRecord], [
              "environmentId",
              "environment_id",
              "computerId",
              "computer_id",
              "id",
            ]) || readProjectOverviewThreadStringFromSources([
              taskPreview,
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
            ], [
              "environmentId",
              "environment_id",
              "computerId",
              "computer_id",
            ]);
            const listedEnvironment = environmentId && environmentsById ? environmentsById[environmentId] || null : null;
            const environmentName = readProjectOverviewThreadStringFromSources([
              environmentRecord,
              listedEnvironment,
            ], [
              "environmentName",
              "environment_name",
              "computerName",
              "computer_name",
              "displayName",
              "display_name",
              "name",
              "title",
            ]) || readProjectOverviewThreadStringFromSources([
              taskPreview,
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
            ], [
              "environmentName",
              "environment_name",
              "computerName",
              "computer_name",
            ]);
            if (environmentName) {
              return environmentName;
            }
            const projectId = readProjectOverviewThreadStringFromSources([projectRecord], [
              "projectId",
              "project_id",
              "id",
            ]) || readProjectOverviewThreadStringFromSources([
              taskPreview,
              missionControl,
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
            ], [
              "projectId",
              "project_id",
            ]);
            return projectId || environmentId || String(selectedProject?.name || selectedProject?.title || "").trim() || "Workspace";
          }

          function getProjectOverviewThreadIdentitySources(value) {
            const source = getProjectOverviewThreadRecordObject(value);
            return [
              source,
              getProjectOverviewThreadRecordObject(source.user),
              getProjectOverviewThreadRecordObject(source.profile),
              getProjectOverviewThreadRecordObject(source.account),
              getProjectOverviewThreadRecordObject(source.identity),
              getProjectOverviewThreadRecordObject(source.member),
            ].filter((entry) => Object.keys(entry).length > 0);
          }

          function normalizeProjectOverviewThreadPersonIdentity(record, fallback = {}) {
            const sources = [
              ...getProjectOverviewThreadIdentitySources(record),
              getProjectOverviewThreadRecordObject(fallback),
            ];
            const email = readProjectOverviewThreadStringFromSources(sources, [
              "email",
              "emailAddress",
              "email_address",
              "mail",
              "userEmail",
              "user_email",
            ]).toLowerCase();
            const name = readProjectOverviewThreadStringFromSources(sources, [
              "displayName",
              "display_name",
              "name",
              "fullName",
              "full_name",
              "label",
              "userName",
              "user_name",
            ]);
            const userId = readProjectOverviewThreadStringFromSources(sources, [
              "userId",
              "user_id",
              "uid",
              "firebaseUid",
              "firebase_uid",
              "accountId",
              "account_id",
              "id",
            ]);
            const avatarUrl = readProjectOverviewThreadStringFromSources(sources, [
              "avatarUrl",
              "avatarURL",
              "avatar_url",
              "photoURL",
              "photoUrl",
              "photo_url",
              "picture",
              "imageUrl",
              "image_url",
              "profileImageUrl",
              "profile_image_url",
            ]);
            return {
              name,
              email,
              userId,
              id: userId,
              avatarUrl: typeof normalizeSessionPhotoUrl === "function" ? normalizeSessionPhotoUrl(avatarUrl) : avatarUrl,
            };
          }

          function getProjectOverviewThreadPersonMatchKeys(identity) {
            const source = getProjectOverviewThreadRecordObject(identity);
            return [
              String(source.email || "").trim().toLowerCase(),
              String(source.userId || "").trim(),
              String(source.id || "").trim(),
            ].filter(Boolean);
          }

          const projectOverviewThreadPersonCandidates = [
            normalizeProjectOverviewThreadPersonIdentity({
              name: currentUserName,
              email: currentUserEmail,
              userId: currentUserId,
              avatarUrl: currentUserAvatarUrl,
            }),
            ...projectOverviewSharedTeamMemberRows.map((member) => normalizeProjectOverviewThreadPersonIdentity(member)),
          ].filter((identity) => getProjectOverviewThreadPersonMatchKeys(identity).length > 0 || String(identity.name || "").trim());

          function findProjectOverviewThreadPersonMatch(identity) {
            const keys = new Set(getProjectOverviewThreadPersonMatchKeys(identity));
            if (keys.size === 0) {
              return null;
            }
            return projectOverviewThreadPersonCandidates.find((candidate) =>
              getProjectOverviewThreadPersonMatchKeys(candidate).some((key) => keys.has(key))
            ) || null;
          }

          function resolveProjectOverviewThreadPersonIdentity(record, fallback = {}) {
            const identity = normalizeProjectOverviewThreadPersonIdentity(record, fallback);
            const matchingIdentity = findProjectOverviewThreadPersonMatch(identity);
            if (!matchingIdentity) {
              return identity;
            }
            return {
              ...identity,
              name: identity.name || matchingIdentity.name || "",
              email: identity.email || matchingIdentity.email || "",
              userId: identity.userId || matchingIdentity.userId || "",
              id: identity.id || matchingIdentity.id || "",
              avatarUrl: identity.avatarUrl || matchingIdentity.avatarUrl || "",
            };
          }

          function getProjectOverviewThreadPersonLabel(identity) {
            const source = getProjectOverviewThreadRecordObject(identity);
            const email = String(source.email || "").trim().toLowerCase();
            const name = String(source.name || source.displayName || source.display_name || "").trim();
            return (typeof getTrustedDisplayName === "function" ? getTrustedDisplayName(name, email) : name)
              || (email && typeof formatAccountDisplayName === "function" ? formatAccountDisplayName("", email, "") : "")
              || name
              || String(source.userId || source.id || "").trim();
          }

          function getProjectOverviewThreadTriggeredByIdentity(thread) {
            const parts = getProjectOverviewThreadMetadataParts(thread);
            const identitySources = [
              parts.rawThread.triggeredBy,
              parts.rawThread.triggered_by,
              parts.rawThread.createdBy,
              parts.rawThread.created_by,
              parts.rawThread.creator,
              parts.rawThread.author,
              parts.rawThread.user,
              parts.rawThread.actor,
              parts.rawThread.initiator,
              parts.rawThread.requestedBy,
              parts.rawThread.requested_by,
              parts.metadata.triggeredBy,
              parts.metadata.triggered_by,
              parts.metadata.createdBy,
              parts.metadata.created_by,
              parts.metadata.creator,
              parts.metadata.author,
              parts.metadata.user,
              parts.metadata.actor,
              parts.metadata.initiator,
              parts.metadata.requestedBy,
              parts.metadata.requested_by,
              parts.runner.triggeredBy,
              parts.runner.triggered_by,
              parts.runner.createdBy,
              parts.runner.created_by,
              parts.runner.creator,
              parts.runner.author,
              parts.runner.user,
              parts.runner.actor,
              parts.runner.initiator,
              parts.runner.requestedBy,
              parts.runner.requested_by,
            ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
            for (const identitySource of identitySources) {
              const resolvedIdentity = resolveProjectOverviewThreadPersonIdentity(identitySource, identitySource);
              if (getProjectOverviewThreadPersonLabel(resolvedIdentity)) {
                return resolvedIdentity;
              }
            }
            const directSources = [
              parts.rawThread,
              parts.metadata,
              parts.runner,
              parts.sourceRecord,
              parts.triggerRecord,
              parts.missionControl,
              parts.agentAssistant,
            ];
            const displayName = readProjectOverviewThreadStringFromSources(directSources, [
              "triggeredByDisplayName",
              "triggered_by_display_name",
              "triggeredByName",
              "triggered_by_name",
              "createdByDisplayName",
              "created_by_display_name",
              "createdByName",
              "created_by_name",
              "creatorDisplayName",
              "creator_display_name",
              "creatorName",
              "creator_name",
              "authorName",
              "author_name",
              "userDisplayName",
              "user_display_name",
              "userName",
              "user_name",
              "requestedByName",
              "requested_by_name",
              "operatorName",
              "operator_name",
            ]);
            const email = readProjectOverviewThreadStringFromSources(directSources, [
              "triggeredByEmail",
              "triggered_by_email",
              "createdByEmail",
              "created_by_email",
              "creatorEmail",
              "creator_email",
              "authorEmail",
              "author_email",
              "userEmail",
              "user_email",
              "requestedByEmail",
              "requested_by_email",
              "operatorEmail",
              "operator_email",
            ]);
            const avatarUrl = readProjectOverviewThreadStringFromSources(directSources, [
              "triggeredByAvatarUrl",
              "triggered_by_avatar_url",
              "createdByAvatarUrl",
              "created_by_avatar_url",
              "creatorAvatarUrl",
              "creator_avatar_url",
              "authorAvatarUrl",
              "author_avatar_url",
              "userAvatarUrl",
              "user_avatar_url",
              "photoURL",
              "photoUrl",
              "photo_url",
              "avatarUrl",
              "avatar_url",
            ]);
            const identityKey = readProjectOverviewThreadStringFromSources(directSources, [
              "triggeredByUserId",
              "triggered_by_user_id",
              "triggeredBy",
              "triggered_by",
              "createdByUserId",
              "created_by_user_id",
              "creatorUserId",
              "creator_user_id",
              "authorUserId",
              "author_user_id",
              "userId",
              "user_id",
              "requestedByUserId",
              "requested_by_user_id",
              "operatorUserId",
              "operator_user_id",
              "createdBy",
              "created_by",
              "creatorId",
              "creator_id",
            ]);
            const keyIsEmail = identityKey.includes("@");
            const resolvedIdentity = resolveProjectOverviewThreadPersonIdentity({
              name: displayName,
              email: email || (keyIsEmail ? identityKey : ""),
              userId: keyIsEmail ? "" : identityKey,
              id: identityKey,
              avatarUrl,
            }, {
              name: displayName,
              email,
              userId: keyIsEmail ? "" : identityKey,
              id: identityKey,
              avatarUrl,
            });
            return getProjectOverviewThreadPersonLabel(resolvedIdentity) ? resolvedIdentity : null;
          }

          const projectOverviewThreadTableRowOptions = {
            getSourceLabel: getProjectOverviewThreadSourceLabel,
            getEnvironmentLabel: getProjectOverviewThreadEnvironmentLabel,
            getTriggeredByLabel: (thread) => getProjectOverviewThreadPersonLabel(getProjectOverviewThreadTriggeredByIdentity(thread)) || "-",
            getTriggeredByAvatarUrl: (thread) => {
              const identity = getProjectOverviewThreadTriggeredByIdentity(thread);
              return identity?.avatarUrl || identity?.photoURL || "";
            },
            getDateLabel: (thread, safeThread) => (
              (typeof formatThreadSearchTimestamp === "function"
                ? formatThreadSearchTimestamp(typeof resolveThreadSortTimestamp === "function" ? resolveThreadSortTimestamp(safeThread) : (safeThread?.updatedAt || safeThread?.createdAt || ""))
                : "")
              || (typeof formatRelativeThreadTime === "function" ? formatRelativeThreadTime(safeThread?.updatedAt || safeThread?.createdAt) : "")
              || "—"
            ),
            onOpenThread: (threadId, safeThread) => {
              if (typeof upsertRealThreadRecord === "function") {
                upsertRealThreadRecord(safeThread);
              }
              if (typeof onThreadOpen === "function") {
                onThreadOpen(threadId, { threadRecord: safeThread });
              } else if (typeof handleThreadSelect === "function") {
                handleThreadSelect(threadId);
              }
            },
            onThreadActions: (event, threadId, safeThread) => {
              if (typeof onThreadOptionsOpen === "function") {
                onThreadOptionsOpen(event, threadId, { threadRecord: safeThread });
                return;
              }
              if (typeof upsertRealThreadRecord === "function") {
                upsertRealThreadRecord(safeThread);
              }
              if (typeof openThreadActionMenu === "function") {
                openThreadActionMenu(event, threadId, safeThread);
              }
            },
          };

          function renderOverviewResourceRow(resource) {
            return React.createElement("div", {
                key: resource.id || resource.title,
                className: "playground-project-overview-resources-table-row",
              },
              React.createElement("div", { className: "playground-project-overview-resource-cell" },
                React.createElement("div", { className: "playground-plugin-row-title" }, resource?.title || "Untitled Resource")
              ),
              React.createElement("div", {
                className: "playground-project-overview-resource-cell is-endpoint",
                title: resource?.endpoint || "",
              }, resource?.endpoint || "Internal"),
              React.createElement("div", { className: "playground-project-overview-resource-cell is-creator" },
                renderProjectOverviewResourceCreator({ record: resource })
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

          function renderProjectOverviewObservabilityChart() {
            return React.createElement("div", { className: "playground-project-overview-chart-surface" },
              React.createElement("div", { className: "playground-project-overview-chart-grid" },
                React.createElement("section", {
                  className: "playground-settings-usage-chart-card playground-project-overview-chart-card" + (!projectHasCostData ? " is-cost-empty" : ""),
                },
                  React.createElement("div", { className: "playground-project-overview-summary-kpis playground-project-overview-chart-kpis" },
                    projectOverviewKpis.map((item) =>
                      React.createElement("div", { key: item.id, className: "playground-project-overview-summary-kpi" },
                        React.createElement("div", { className: "playground-project-overview-summary-kpi-heading" },
                          React.createElement("div", { className: "playground-project-overview-summary-kpi-label" }, item.label)
                        ),
                        React.createElement("div", { className: "playground-project-overview-summary-kpi-value" }, item.value)
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-project-overview-chart-header" },
                    React.createElement("div", { className: "playground-project-overview-chart-header-main" },
                      React.createElement("div", { className: "playground-project-overview-chart-title" }, "Cost by Resource")
                    )
                  ),
                  React.createElement(React.Fragment, null,
                    renderProjectOverviewMultiStackedChart({
                      labels: projectThreadTimeline.map((bucket) => bucket.label),
                      series: projectComputeSeries,
                      yMax: maxProjectDailyCt,
                      tickFormatter: formatProjectOverviewAxisCt,
                      tall: true,
                      ariaLabel: "Project cost by resource type",
                      emptyText: "No project cost yet",
                      emptyContent: renderProjectOverviewCostEmptyState(),
                    }),
                    React.createElement("div", { className: "playground-project-overview-chart-footer-row" },
                      projectHasCostData
                        ? React.createElement("div", {
                            className: "playground-settings-usage-inline-legend",
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
                        : React.createElement("div", { className: "playground-settings-usage-inline-legend" }),
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
                  renderProjectOverviewFilesNavCards()
                )
              )
            );
          }

          function renderProjectOverviewThreadsToolbar() {
            return React.createElement("div", { className: "playground-agents-overview-sticky-table-header playground-project-overview-threads-sticky-table-header" },
              React.createElement("div", { className: "playground-plugins-search-row playground-agents-overview-search-row playground-project-overview-threads-toolbar", ref: projectOverviewThreadsToolbarRef },
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
              )
            );
          }

          function renderProjectOverviewThreadsSection() {
            return React.createElement("section", { className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-overview-list-section playground-agents-overview-table-section" },
              renderOverviewSectionHeader("Threads", null),
              projectOverviewFilteredThreads.length > 0
                ? renderPlaygroundThreadOverviewTable({
                    threads: visibleProjectThreads,
                    rowOptions: {
                      ...projectOverviewThreadTableRowOptions,
                      useAgentsOverviewTable: true,
                      selectable: true,
                      toolbarContent: renderProjectOverviewThreadsToolbar(),
                      selectedIds: selectedProjectOverviewThreadIds,
                      allVisibleSelected: allVisibleProjectThreadsSelected,
                      partialSelection: hasPartialVisibleProjectThreadSelection,
                      onToggleSelection: toggleProjectOverviewThreadSelection,
                      onToggleVisibleSelection: toggleVisibleProjectOverviewThreadSelection,
                    },
                  })
                : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    hasProjectOverviewThreadListFilters ? "No matching project threads." : "No project threads yet."
                  )
            );
          }

          function renderProjectOverviewObservabilityPanel() {
            if (isProjectOverviewResourceSubviewOpen) {
              return React.createElement("div", { className: "playground-tasks-project-panel-grid" },
                renderProjectOverviewFilesTab(),
                renderProjectOverviewFileMenu()
              );
            }
            return React.createElement(React.Fragment, null,
              renderProjectOverviewObservabilityChart(),
              React.createElement("div", { className: "playground-tasks-project-panel-grid" },
                renderProjectOverviewThreadsSection()
              )
            );
          }

          function renderProjectOverviewProgressChart() {
            const scopeCount = Math.max(
              0,
              Number(selectedProjectTaskStatusOverview?.total) || 0,
              Number(selectedProjectSummary?.tasksCount) || 0,
              normalizedOverviewTasks.length
            );
            const completedCount = Math.max(0, Math.min(scopeCount, Number(selectedProjectTaskStatusOverview?.done) || 0));
            const startedCount = Math.max(0, Math.min(
              scopeCount,
              completedCount + (Number(selectedProjectTaskStatusOverview?.inProgress) || 0)
            ));
            const rowData = [
              { id: "scope", label: "Scope", value: scopeCount, percent: 100 },
              { id: "started", label: "Started", value: startedCount, percent: scopeCount > 0 ? Math.round((startedCount / scopeCount) * 100) : 0 },
              { id: "completed", label: "Completed", value: completedCount, percent: scopeCount > 0 ? Math.round((completedCount / scopeCount) * 100) : 0 },
            ];
            const chartWidth = 1000;
            const chartHeight = 220;
            const paddingX = 8;
            const paddingTop = 18;
            const paddingBottom = 36;
            const maxValue = Math.max(1, scopeCount, startedCount, completedCount);
            const pointCount = 6;
            function makeValues(target, curve) {
              return curve.map((factor) => Math.round(Math.max(0, target) * factor));
            }
            const series = [
              { id: "scope", values: makeValues(scopeCount, [0, 0.22, 0.4, 0.58, 0.8, 1]) },
              { id: "started", values: makeValues(startedCount, [0, 0.18, 0.56, 0.78, 0.9, 1]) },
              { id: "completed", values: makeValues(completedCount, [0, 0.08, 0.28, 0.54, 0.78, 1]) },
            ];
            function getPoint(value, index) {
              const x = paddingX + (index / Math.max(1, pointCount - 1)) * (chartWidth - paddingX * 2);
              const y = paddingTop + (1 - (value / maxValue)) * (chartHeight - paddingTop - paddingBottom);
              return { x, y };
            }
            function buildPath(values) {
              return values.map((value, index) => {
                const point = getPoint(value, index);
                return (index === 0 ? "M" : "L") + point.x.toFixed(1) + " " + point.y.toFixed(1);
              }).join(" ");
            }
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            const startLabel = startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            const endLabel = endDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

            return React.createElement("div", { className: "playground-project-overview-progress-chart" },
              React.createElement("svg", {
                className: "playground-project-overview-progress-svg",
                viewBox: "0 0 " + chartWidth + " " + chartHeight,
                preserveAspectRatio: "none",
                role: "img",
                "aria-label": "Project progress by task status",
              },
                [0.25, 0.5, 0.75].map((fraction) =>
                  React.createElement("line", {
                    key: "guide:" + fraction,
                    className: "playground-project-overview-progress-guide",
                    x1: paddingX,
                    x2: chartWidth - paddingX,
                    y1: paddingTop + (chartHeight - paddingTop - paddingBottom) * fraction,
                    y2: paddingTop + (chartHeight - paddingTop - paddingBottom) * fraction,
                  })
                ),
                React.createElement("line", {
                  className: "playground-project-overview-progress-axis",
                  x1: paddingX,
                  x2: chartWidth - paddingX,
                  y1: chartHeight - paddingBottom,
                  y2: chartHeight - paddingBottom,
                }),
                series.map((entry) =>
                  React.createElement("path", {
                    key: entry.id,
                    className: "playground-project-overview-progress-line is-" + entry.id,
                    d: buildPath(entry.values),
                  })
                ),
                series.map((entry) => {
                  const point = getPoint(entry.values[entry.values.length - 1] || 0, entry.values.length - 1);
                  return React.createElement("circle", {
                    key: "dot:" + entry.id,
                    className: "playground-project-overview-progress-dot is-" + entry.id,
                    cx: point.x,
                    cy: point.y,
                    r: 6,
                    fill: entry.id === "completed" ? "rgb(56, 204, 164)" : entry.id === "started" ? "rgb(122, 126, 255)" : "rgba(255, 255, 255, 0.7)",
                  });
                })
              ),
              React.createElement("div", { className: "playground-project-overview-progress-labels" },
                React.createElement("span", null, startLabel),
                React.createElement("span", null, endLabel)
              ),
              React.createElement("div", { className: "playground-project-overview-progress-legend" },
                rowData.map((row) =>
                  React.createElement("div", { key: row.id, className: "playground-project-overview-progress-legend-row" },
                    React.createElement("div", { className: "playground-project-overview-progress-legend-name" },
                      React.createElement("span", { className: "playground-project-overview-progress-swatch is-" + row.id }),
                      React.createElement("span", null, row.label)
                    ),
                    React.createElement("div", { className: "playground-project-overview-progress-legend-percent" }, row.percent + "%"),
                    React.createElement("div", { className: "playground-project-overview-progress-legend-count" }, row.value)
                  )
                )
              )
            );
          }

          function readProjectOverviewActivityActorString(source, keys) {
            if (!source || typeof source !== "object" || Array.isArray(source)) {
              return "";
            }
            for (const key of keys) {
              const value = source[key];
              if (typeof value === "string" && value.trim()) {
                return value.trim();
              }
              if (typeof value === "number" && Number.isFinite(value)) {
                return String(value);
              }
            }
            return "";
          }

          function getProjectOverviewActivityActorSnapshot(source) {
            const metadata = source?.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
              ? source.metadata
              : {};
            const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
              ? metadata.runnerPlayground
              : {};
            const taskPreview = runnerPlayground?.taskPreview && typeof runnerPlayground.taskPreview === "object" && !Array.isArray(runnerPlayground.taskPreview)
              ? runnerPlayground.taskPreview
              : {};
            const nestedAgent = source?.agent && typeof source.agent === "object" && !Array.isArray(source.agent)
              ? source.agent
              : {};
            return {
              id: readProjectOverviewActivityActorString(source, ["agentId", "agent_id", "assigneeId", "assigneeAgentId"])
                || readProjectOverviewActivityActorString(metadata, ["agentId", "agent_id", "assigneeId", "assigneeAgentId"])
                || readProjectOverviewActivityActorString(runnerPlayground, ["agentId", "agent_id"])
                || readProjectOverviewActivityActorString(taskPreview, ["agentId", "agent_id"]),
              name: readProjectOverviewActivityActorString(source, ["name", "agentName", "agent_name", "assigneeName", "assignee", "actorName", "label", "displayName"])
                || readProjectOverviewActivityActorString(metadata, ["agentName", "agent_name", "assigneeName", "actorName"])
                || readProjectOverviewActivityActorString(runnerPlayground, ["agentName", "agent_name"])
                || readProjectOverviewActivityActorString(taskPreview, ["agentName", "agent_name"])
                || readProjectOverviewActivityActorString(nestedAgent, ["name", "label", "displayName"]),
              photoUrl: readProjectOverviewActivityActorString(source, ["photoUrl", "profilePhotoUrl", "avatarUrl", "agentPhotoUrl", "agent_photo_url", "agentAvatarUrl", "agent_avatar_url", "assigneePhotoUrl", "assigneeAvatarUrl", "actorAvatarUrl"])
                || readProjectOverviewActivityActorString(metadata, ["agentPhotoUrl", "agent_photo_url", "agentAvatarUrl", "agent_avatar_url", "assigneePhotoUrl", "actorAvatarUrl"])
                || readProjectOverviewActivityActorString(runnerPlayground, ["agentPhotoUrl", "agent_photo_url", "agentAvatarUrl", "agent_avatar_url"])
                || readProjectOverviewActivityActorString(taskPreview, ["agentPhotoUrl", "agent_photo_url", "agentAvatarUrl", "agent_avatar_url"])
                || readProjectOverviewActivityActorString(nestedAgent, ["profilePhotoUrl", "photoUrl", "avatarUrl", "picture"]),
            };
          }

          function resolveProjectOverviewActivityActor(agentId, fallbackName, fallbackActor) {
            const normalizedAgentId = String(agentId || "").trim();
            const fallbackSnapshot = getProjectOverviewActivityActorSnapshot(fallbackActor || {});
            const fallbackSnapshotName = String(fallbackSnapshot.name || "").trim();
            const rawFallback = String(fallbackName || "").trim();
            const fallback = (rawFallback && rawFallback.toLowerCase() !== "agent" ? rawFallback : "") || fallbackSnapshotName || rawFallback;
            let resolvedAgent = normalizedAgentId && agentsById ? agentsById[normalizedAgentId] || null : null;
            if (!resolvedAgent && normalizedAgentId && typeof assignableActorsById !== "undefined" && assignableActorsById) {
              resolvedAgent = assignableActorsById[normalizedAgentId] || null;
            }
            const fallbackKey = fallback.toLowerCase();
            if (!resolvedAgent && fallbackKey) {
              const candidates = []
                .concat(Object.values(agentsById || {}))
                .concat(typeof sortedAgents !== "undefined" && Array.isArray(sortedAgents) ? sortedAgents : [])
                .concat(typeof assignableActors !== "undefined" && Array.isArray(assignableActors) ? assignableActors : []);
              resolvedAgent = candidates.find((agent) =>
                String(agent?.name || "").trim().toLowerCase() === fallbackKey
                || String(agent?.label || "").trim().toLowerCase() === fallbackKey
              ) || null;
            }
            const actorName = String(resolvedAgent?.name || resolvedAgent?.label || fallbackSnapshotName || fallback || "Agent").trim();
            let photoUrl = resolvedAgent && typeof getPlaygroundAgentProfilePhotoUrl === "function"
              ? getPlaygroundAgentProfilePhotoUrl(resolvedAgent)
              : "";
            if (!photoUrl) {
              photoUrl = String(fallbackSnapshot.photoUrl || "").trim();
            }
            if (!photoUrl) {
              const defaultPhotoUrls = {
                spark: "/img/agent-profile-pics/spark.webp",
                forge: "/img/agent-profile-pics/forge.webp",
                foundry: "/img/agent-profile-pics/foundry.webp",
              };
              photoUrl = defaultPhotoUrls[actorName.toLowerCase()] || "";
            }
            return {
              id: normalizedAgentId || fallbackSnapshot.id || "",
              name: actorName || "Agent",
              photoUrl: photoUrl && typeof normalizeSessionPhotoUrl === "function" ? normalizeSessionPhotoUrl(photoUrl) : photoUrl,
            };
          }

          function formatProjectOverviewActivityTimeLabel(value, fallbackLabel = "") {
            const parsed = typeof value === "number"
              ? value
              : Date.parse(String(value || ""));
            if (!Number.isFinite(parsed) || parsed <= 0) {
              const fallback = String(fallbackLabel || "").trim();
              const compactMatch = fallback.match(/^(\d+)\s*([MHDW])$/i);
              if (!compactMatch) return fallback;
              const amount = Math.max(1, Number(compactMatch[1]) || 1);
              const unitKey = compactMatch[2].toUpperCase();
              const unit = unitKey === "M"
                ? "minute"
                : unitKey === "H"
                  ? "hour"
                  : unitKey === "D"
                    ? "day"
                    : "week";
              return amount + " " + unit + (amount === 1 ? "" : "s") + " ago";
            }
            const diffMs = Math.max(0, Date.now() - parsed);
            const minuteMs = 60 * 1000;
            const hourMs = 60 * minuteMs;
            const dayMs = 24 * hourMs;
            const weekMs = 7 * dayMs;
            const monthMs = 30 * dayMs;
            const amount = diffMs < hourMs
              ? Math.max(1, Math.round(diffMs / minuteMs))
              : diffMs < dayMs
                ? Math.max(1, Math.round(diffMs / hourMs))
                : diffMs < weekMs
                  ? Math.max(1, Math.round(diffMs / dayMs))
                  : diffMs < monthMs
                    ? Math.max(1, Math.round(diffMs / weekMs))
                    : Math.max(1, Math.round(diffMs / monthMs));
            const unit = diffMs < hourMs
              ? "minute"
              : diffMs < dayMs
                ? "hour"
                : diffMs < weekMs
                  ? "day"
                  : diffMs < monthMs
                    ? "week"
                    : "month";
            return amount + " " + unit + (amount === 1 ? "" : "s") + " ago";
          }

          function buildProjectOverviewActivityItems() {
            const items = [];
            projectOverviewFilteredThreads.forEach((thread) => {
              const { safeThread, displayThreadTitle } = typeof getSidebarThreadTitleParts === "function"
                ? getSidebarThreadTitleParts(thread)
                : { safeThread: thread, displayThreadTitle: thread?.title || "Untitled thread" };
              const threadActor = typeof getPlaygroundThreadActorInfo === "function"
                ? getPlaygroundThreadActorInfo(safeThread, agentsById, "Agent")
                : { id: String(safeThread?.agentId || "").trim(), name: "Agent" };
              const threadTaskPreview = typeof getThreadTaskPreview === "function"
                ? getThreadTaskPreview(safeThread)
                : null;
              const threadTaskId = String(threadTaskPreview?.taskId || safeThread?.taskId || "").trim();
              const threadTask = threadTaskId ? normalizedOverviewTasksById[threadTaskId] || null : null;
              const threadActivityActor = resolveProjectOverviewActivityActor(threadActor?.id, threadActor?.name || "Agent", {
                ...safeThread,
                ...threadActor,
              });
              const timestamp = Date.parse(String(safeThread?.updatedAt || safeThread?.createdAt || ""));
              items.push({
                id: "thread:" + String(safeThread?.id || displayThreadTitle || items.length),
                actorId: String(threadActivityActor.id || threadActor?.id || "").trim(),
                actor: threadActivityActor.name,
                photoUrl: threadActivityActor.photoUrl,
                task: threadTask,
                verb: "worked on",
                object: displayThreadTitle || "Untitled thread",
                taskId: threadTaskId,
                permissionActionId: "local_skill_run",
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: formatProjectOverviewActivityTimeLabel(safeThread?.updatedAt || safeThread?.createdAt),
              });
            });
            (projectOverviewFileActivityState?.items || []).forEach((row, index) => {
              const assigneeId = String(row?.assigneeId || "").trim();
              const fileActivityActor = resolveProjectOverviewActivityActor(assigneeId, row?.assignee || "Agent", row);
              const fileTaskId = String(row?.taskId || "").trim();
              const fileTask = fileTaskId ? normalizedOverviewTasksById[fileTaskId] || null : null;
              const timestamp = Number(row?.timestamp || 0);
              items.push({
                id: "file:" + String(row?.id || row?.path || index),
                actorId: assigneeId,
                actor: fileActivityActor.name,
                photoUrl: fileActivityActor.photoUrl,
                task: fileTask,
                verb: String(row?.operation || "").trim().toLowerCase() || "updated",
                object: String(row?.title || row?.path || "file").trim(),
                taskId: fileTaskId,
                permissionActionId: String(row?.operationKind || row?.operation || "").toLowerCase().match(/read|view|open|list/)
                  ? "workspace_read"
                  : "workspace_write",
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: formatProjectOverviewActivityTimeLabel(timestamp, row?.dateLabel),
              });
            });
            normalizedOverviewTasks.forEach((task) => {
              const assigneeId = String(task?.assigneeAgentId || "").trim();
              const timestamp = Date.parse(String(task?.updatedAt || task?.createdAt || ""));
              const actorName = typeof getTaskAssigneeName === "function"
                ? getTaskAssigneeName(assigneeId, "Agent")
                : "Agent";
              const taskActivityActor = resolveProjectOverviewActivityActor(assigneeId, actorName, task);
              items.push({
                id: "task:" + String(task?.id || task?.title || items.length),
                actorId: assigneeId,
                actor: taskActivityActor.name,
                photoUrl: taskActivityActor.photoUrl,
                task,
                verb: String(task?.createdAt || "") === String(task?.updatedAt || "") ? "created" : "updated",
                object: task?.title || "Untitled task",
                taskId: String(task?.id || "").trim(),
                permissionActionId: "shared_resource_write",
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: formatProjectOverviewActivityTimeLabel(task?.updatedAt || task?.createdAt),
              });
            });
            return items
              .filter((item) => item.object)
              .sort((left, right) => (right.time || 0) - (left.time || 0));
          }

          function renderProjectOverviewActivityAvatar(item, className = "playground-project-overview-activity-avatar") {
            const actorId = String(item?.actorId || item?.task?.assigneeAgentId || "").trim();
            if (actorId && typeof renderTaskActorAvatar === "function") {
              const avatar = renderTaskActorAvatar(actorId, className);
              if (avatar) {
                return avatar;
              }
            }
            if (item?.task && typeof renderTaskAssigneeAvatar === "function") {
              const avatar = renderTaskAssigneeAvatar(item.task, className);
              if (avatar) {
                return avatar;
              }
            }
            if (typeof renderAgentNameAvatar === "function") {
              return renderAgentNameAvatar(item?.actor, className, item?.photoUrl);
            }
            return React.createElement("div", { className });
          }

          function getProjectOverviewActivityParticipantKey(item) {
            const actorId = String(item?.actorId || item?.task?.assigneeAgentId || "").trim();
            if (actorId) {
              return "id:" + actorId;
            }
            const actorName = String(item?.actor || "").trim().toLowerCase();
            return actorName ? "name:" + actorName : "";
          }

          function buildProjectOverviewActivityParticipants(items) {
            const seen = new Set();
            return (Array.isArray(items) ? items : [])
              .filter((item) => {
                const key = getProjectOverviewActivityParticipantKey(item);
                if (!key || seen.has(key)) {
                  return false;
                }
                seen.add(key);
                return true;
              })
              .slice(0, 5);
          }

          function renderProjectOverviewActivityParticipants(items) {
            const participants = buildProjectOverviewActivityParticipants(items);
            if (!participants.length) {
              return null;
            }
            return React.createElement("div", { className: "playground-project-overview-activity-participants", "aria-label": "Activity participants" },
              participants.map((item) =>
                React.cloneElement(
                  renderProjectOverviewActivityAvatar(item, "playground-project-overview-activity-participant-avatar"),
                  { key: getProjectOverviewActivityParticipantKey(item) || item.id }
                )
              )
            );
          }

          function getProjectOverviewActivityPermissionSet() {
            if (typeof normalizePlaygroundPermissionSet !== "function") {
              return null;
            }
            return normalizePlaygroundPermissionSet(
              projectOverviewDraft?.permissionSet
                || projectOverviewDraft?.metadata?.permissionSet
                || selectedProject?.permissionSet
                || selectedProject?.metadata?.permissionSet,
              "project"
            );
          }

          function renderProjectOverviewActivityPermissionRing(item) {
            if (
              !item?.permissionActionId
              || typeof renderPlaygroundPermissionMiniRingIcon !== "function"
              || typeof getPlaygroundPermissionActionDefinition !== "function"
              || typeof getPlaygroundPermissionActionRingId !== "function"
            ) {
              return null;
            }
            const actionDefinition = getPlaygroundPermissionActionDefinition(item.permissionActionId);
            if (!actionDefinition) {
              return null;
            }
            const permissionSet = getProjectOverviewActivityPermissionSet();
            const actionRingId = getPlaygroundPermissionActionRingId(permissionSet, actionDefinition);
            const ringDefinition = typeof getPlaygroundPermissionRingDefinition === "function"
              ? getPlaygroundPermissionRingDefinition(actionRingId)
              : null;
            const actionAccess = typeof getPlaygroundPermissionActionAccess === "function"
              ? getPlaygroundPermissionActionAccess(permissionSet, actionDefinition)
              : "";
            const accessLabel = typeof getPlaygroundPermissionAccessLabel === "function" && actionAccess
              ? getPlaygroundPermissionAccessLabel(actionAccess)
              : "";
            const label = [
              actionDefinition.label,
              ringDefinition?.label || "",
              accessLabel,
            ].filter(Boolean).join(" · ");
            const ringTitle = ringDefinition
              ? [ringDefinition.label, ringDefinition.title].filter(Boolean).join(" · ")
              : (actionRingId || "Permission ring");
            const ringDescription = ringDefinition?.description || "";
            return React.createElement("span", {
                className: "playground-project-overview-activity-permission",
                "aria-label": label,
                tabIndex: 0,
              },
              renderPlaygroundPermissionMiniRingIcon(actionRingId),
              React.createElement("span", { className: "playground-project-overview-activity-permission-tooltip", role: "tooltip" },
                React.createElement("span", { className: "playground-project-overview-activity-permission-tooltip-title" }, ringTitle),
                ringDescription
                  ? React.createElement("span", { className: "playground-project-overview-activity-permission-tooltip-copy" }, ringDescription)
                  : null
              )
            );
          }

          function renderProjectOverviewActivitySection() {
            const allActivityItems = buildProjectOverviewActivityItems();
            const visibleActivityCount = Math.max(5, Number(projectOverviewVisibleActivityCount) || 5);
            const activityItems = allActivityItems.slice(0, visibleActivityCount);
            const hasMoreActivityItems = activityItems.length < allActivityItems.length;
            const hasLessActivityItems = visibleActivityCount > 5;
            return React.createElement("section", { className: "playground-project-overview-activity-card is-main" },
              React.createElement("div", { className: "playground-project-overview-activity-header" },
                React.createElement("h2", { className: "playground-project-overview-activity-title" }, "Activity"),
                renderProjectOverviewActivityParticipants(activityItems)
              ),
              activityItems.length > 0
                ? React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-project-overview-activity-list" },
                      activityItems.map((item) =>
                        React.createElement("div", { key: item.id, className: "playground-project-overview-activity-row" },
                          renderProjectOverviewActivityAvatar(item),
                          React.createElement("div", { className: "playground-project-overview-activity-copy" },
                            React.createElement("span", { className: "playground-project-overview-activity-actor" }, item.actor),
                            React.createElement("span", null, " " + item.verb + " "),
                            item.taskId && typeof handleSelectTask === "function"
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "playground-project-overview-activity-object is-clickable",
                                  onClick: (event) => {
                                    event.stopPropagation();
                                    handleSelectTask(item.taskId);
                                  },
                                }, item.object)
                              : React.createElement("span", { className: "playground-project-overview-activity-object" }, item.object),
                            item.timeLabel
                              ? React.createElement("span", { className: "playground-project-overview-activity-time" }, " · " + item.timeLabel)
                              : null
                          ),
                          renderProjectOverviewActivityPermissionRing(item)
                        )
                      )
                    ),
                    hasMoreActivityItems || hasLessActivityItems
                      ? React.createElement("div", { className: "playground-project-overview-activity-actions" },
                          hasLessActivityItems
                            ? React.createElement("button", {
                                type: "button",
                                className: "playground-project-overview-activity-show-more",
                                onClick: () => setProjectOverviewVisibleActivityCount(5),
                              }, "Show less")
                            : null,
                          hasMoreActivityItems
                            ? React.createElement("button", {
                                type: "button",
                                className: "playground-project-overview-activity-show-more",
                                onClick: () => setProjectOverviewVisibleActivityCount((current) =>
                                  Math.min(allActivityItems.length, Math.max(5, Number(current) || 5) + 10)
                                ),
                              }, "Show more")
                            : null
                        )
                      : null
                  )
                : React.createElement("div", { className: "playground-project-overview-activity-empty" },
                    "Project activity will appear here once agents create tasks, run threads, or update files."
                  )
            );
          }

          function getProjectOverviewProgressStats() {
            const scopeCount = Math.max(
              0,
              Number(selectedProjectTaskStatusOverview?.total) || 0,
              Number(selectedProjectSummary?.tasksCount) || 0,
              normalizedOverviewTasks.length
            );
            const completedCount = Math.max(0, Math.min(scopeCount, Number(selectedProjectTaskStatusOverview?.done) || 0));
            const startedCount = Math.max(0, Math.min(
              scopeCount,
              completedCount + (Number(selectedProjectTaskStatusOverview?.inProgress) || 0)
            ));
            return {
              scopeCount,
              startedCount,
              completedCount,
              rows: [
                { id: "scope", label: "Scope", value: scopeCount, percent: 100 },
                { id: "started", label: "Started", value: startedCount, percent: scopeCount > 0 ? Math.round((startedCount / scopeCount) * 100) : 0 },
                { id: "completed", label: "Completed", value: completedCount, percent: scopeCount > 0 ? Math.round((completedCount / scopeCount) * 100) : 0 },
              ],
            };
          }

          function parseProjectOverviewTaskTimelineTimestamp(...values) {
            for (const value of values) {
              if (typeof value === "number" && Number.isFinite(value) && value > 0) {
                return value;
              }
              if (typeof value !== "string" || !value.trim()) {
                continue;
              }
              const timestamp = Date.parse(value.trim());
              if (Number.isFinite(timestamp)) {
                return timestamp;
              }
            }
            return null;
          }

          function getProjectOverviewTaskStatusId(task) {
            return String(task?.status || "").trim().toLowerCase();
          }

          function isProjectOverviewTaskStartedStatus(status) {
            return status === "in_progress" || status === "in_review" || status === "done";
          }

          function isProjectOverviewTaskCompletedStatus(status) {
            return status === "done";
          }

          function buildProjectOverviewThreadTimestampById() {
            return projectThreads.reduce((map, thread) => {
              const threadId = String(thread?.id || thread?.threadId || "").trim();
              if (!threadId) {
                return map;
              }
              const timestamp = parseProjectOverviewTaskTimelineTimestamp(
                thread?.startedAt,
                thread?.createdAt,
                thread?.updatedAt,
                thread?.completedAt,
                thread?.finishedAt,
                thread?.endedAt
              );
              if (Number.isFinite(timestamp)) {
                map[threadId] = timestamp;
              }
              return map;
            }, Object.create(null));
          }

          function getProjectOverviewTaskEarliestLinkedThreadTimestamp(task, threadTimestampById) {
            const threadIds = new Set();
            if (typeof task?.lastStartedThreadId === "string" && task.lastStartedThreadId.trim()) {
              threadIds.add(task.lastStartedThreadId.trim());
            }
            if (Array.isArray(task?.linkedThreadIds)) {
              task.linkedThreadIds.forEach((threadId) => {
                if (typeof threadId === "string" && threadId.trim()) {
                  threadIds.add(threadId.trim());
                }
              });
            }
            let earliest = null;
            threadIds.forEach((threadId) => {
              const timestamp = threadTimestampById?.[threadId];
              if (!Number.isFinite(timestamp)) {
                return;
              }
              earliest = earliest === null ? timestamp : Math.min(earliest, timestamp);
            });
            return earliest;
          }

          function buildProjectOverviewProgressSeriesForBuckets(dailyCtBuckets) {
            const tasksForTimeline = Array.isArray(normalizedOverviewTasks) ? normalizedOverviewTasks : [];
            const threadTimestampById = buildProjectOverviewThreadTimestampById();
            const bucketEndTimes = dailyCtBuckets.map((bucket) => {
              const key = String(bucket?.key || "").trim();
              const timestamp = Date.parse(key + "T23:59:59.999");
              return Number.isFinite(timestamp) ? timestamp : null;
            });
            const scopeValues = [];
            const startedValues = [];
            const completedValues = [];

            bucketEndTimes.forEach((bucketEndTime) => {
              let scopeCount = 0;
              let startedCount = 0;
              let completedCount = 0;

              tasksForTimeline.forEach((task) => {
                const createdAt = parseProjectOverviewTaskTimelineTimestamp(
                  task?.createdAt,
                  task?.created_at,
                  task?.insertedAt,
                  task?.metadata?.createdAt
                );
                const taskExistsByBucket = bucketEndTime === null
                  || createdAt === null
                  || createdAt <= bucketEndTime;
                if (!taskExistsByBucket) {
                  return;
                }

                scopeCount += 1;

                const status = getProjectOverviewTaskStatusId(task);
                const linkedStartedAt = getProjectOverviewTaskEarliestLinkedThreadTimestamp(task, threadTimestampById);
                const fallbackStartedAt = isProjectOverviewTaskStartedStatus(status)
                  ? parseProjectOverviewTaskTimelineTimestamp(
                      linkedStartedAt,
                      task?.startedAt,
                      task?.updatedAt,
                      task?.createdAt
                    )
                  : null;
                const startedAt = linkedStartedAt !== null ? linkedStartedAt : fallbackStartedAt;
                if (
                  startedAt !== null
                  && (bucketEndTime === null || startedAt <= bucketEndTime)
                ) {
                  startedCount += 1;
                }

                const completedAt = parseProjectOverviewTaskTimelineTimestamp(
                  task?.completedAt,
                  task?.finishedAt,
                  task?.closedAt,
                  isProjectOverviewTaskCompletedStatus(status) ? task?.updatedAt : null,
                  isProjectOverviewTaskCompletedStatus(status) ? task?.createdAt : null
                );
                if (
                  completedAt !== null
                  && (bucketEndTime === null || completedAt <= bucketEndTime)
                ) {
                  completedCount += 1;
                }
              });

              scopeValues.push(scopeCount);
              startedValues.push(Math.min(startedCount, scopeCount));
              completedValues.push(Math.min(completedCount, scopeCount));
            });

            return [
              { id: "scope", values: scopeValues },
              { id: "started", values: startedValues },
              { id: "completed", values: completedValues },
            ];
          }

          function buildProjectOverviewDailyCtBuckets(bucketCount) {
            const now = new Date();
            const endDate = new Date(now);
            endDate.setHours(0, 0, 0, 0);
            const buckets = [];
            const bucketIndexByKey = new Map();
            for (let index = 0; index < bucketCount; index += 1) {
              const date = new Date(endDate);
              date.setDate(endDate.getDate() - (bucketCount - 1 - index));
              const key = getProjectOverviewLocalDayKey(date);
              const bucket = {
                key,
                label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                totalCT: 0,
              };
              bucketIndexByKey.set(key, buckets.length);
              buckets.push(bucket);
            }

            const projectCostSummary = projectOverviewCostSummaryState?.summary;
            const projectCostSummaryDays = Array.isArray(projectCostSummary?.byDay) ? projectCostSummary.byDay : [];
            if (projectOverviewCostSummaryState?.status === "ready" && projectCostSummary) {
              projectCostSummaryDays.forEach((day) => {
                const timestamp = Date.parse(String(day?.date || "") + "T00:00:00");
                if (!Number.isFinite(timestamp)) {
                  return;
                }
                const bucketIndex = bucketIndexByKey.get(getProjectOverviewLocalDayKey(new Date(timestamp)));
                if (typeof bucketIndex !== "number") {
                  return;
                }
                buckets[bucketIndex].totalCT += Math.max(0, Number(readSettingsComputeTokens(day, "totalCT", "totalCost") || 0));
              });
              return buckets;
            }

            projectThreads.forEach((thread) => {
              const timestamp = Date.parse(String(thread?.updatedAt || thread?.createdAt || ""));
              if (!Number.isFinite(timestamp)) {
                return;
              }
              const bucketIndex = bucketIndexByKey.get(getProjectOverviewLocalDayKey(new Date(timestamp)));
              if (typeof bucketIndex !== "number") {
                return;
              }
              buckets[bucketIndex].totalCT += Math.max(0, Number(readSettingsComputeTokens(thread, "totalCT", "totalCost") || 0));
            });
            return buckets;
          }

          function PlaygroundProjectOverviewProgressUsageChart({ dailyCtBuckets, maxDailyCt, maxProgressValue, series }) {
            const canvasRef = useRef(null);
            const chartRef = useRef(null);
            const chartSignature = JSON.stringify({
              buckets: dailyCtBuckets.map((bucket) => ({
                key: bucket?.key || "",
                label: bucket?.label || "",
                totalCT: Math.max(0, Number(bucket?.totalCT || 0)),
              })),
              maxDailyCt,
              maxProgressValue,
              series: series.map((entry) => ({
                id: entry.id,
                values: Array.isArray(entry.values) ? entry.values : [],
              })),
            });

            useEffect(() => () => {
              if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
              }
            }, []);

            useEffect(() => {
              const canvas = canvasRef.current;
              if (!canvas || typeof Chart !== "function") {
                return undefined;
              }

              const labels = dailyCtBuckets.map((bucket) => String(bucket?.label || ""));
              const dailyCtValues = dailyCtBuckets.map((bucket) => Math.max(0, Number(bucket?.totalCT || 0)));
              const longRangeTickIndexes = (() => {
                if (labels.length < 90) {
                  return null;
                }
                const targetCount = labels.length >= 365 ? 7 : 6;
                const indexes = new Set();
                for (let tickIndex = 0; tickIndex < targetCount; tickIndex += 1) {
                  indexes.add(Math.round(((labels.length - 1) * tickIndex) / Math.max(1, targetCount - 1)));
                }
                return indexes;
              })();
              const seriesById = series.reduce((map, entry) => {
                map[entry.id] = Array.isArray(entry.values) ? entry.values : [];
                return map;
              }, {});
              function makeVerticalGradient(context, stops, fallback) {
                const chart = context?.chart;
                const chartArea = chart?.chartArea;
                const ctx = chart?.ctx;
                if (!ctx || !chartArea) {
                  return fallback;
                }
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
                return gradient;
              }
              const hoverGuidePlugin = {
                id: "projectOverviewProgressHoverGuide",
                afterDatasetsDraw: (chartInstance) => {
                  const activeElements = chartInstance?.tooltip?.getActiveElements?.() || [];
                  if (!activeElements.length) {
                    return;
                  }
                  const activeIndex = activeElements[0]?.index;
                  const activeElement = activeElements[0]?.element;
                  const chartArea = chartInstance.chartArea;
                  const ctx = chartInstance.ctx;
                  if (!ctx || !chartArea || typeof activeIndex !== "number" || !activeElement) {
                    return;
                  }
                  const x = activeElement.x;
                  const label = String(chartInstance?.data?.labels?.[activeIndex] || "");
                  if (!label) {
                    return;
                  }
                  ctx.save();
                  ctx.setLineDash([4, 4]);
                  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(x, chartArea.top + 8);
                  ctx.lineTo(x, chartArea.bottom);
                  ctx.stroke();
                  ctx.setLineDash([]);
                  ctx.font = "500 12px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";
                  const metrics = ctx.measureText(label);
                  const paddingX = 8;
                  const labelWidth = metrics.width + paddingX * 2;
                  const labelHeight = 24;
                  const labelX = Math.min(Math.max(x - labelWidth / 2, chartArea.left), chartArea.right - labelWidth);
                  const labelY = chartArea.top - 2;
                  const radius = 6;
                  ctx.fillStyle = "rgba(46, 46, 52, 0.96)";
                  ctx.beginPath();
                  ctx.moveTo(labelX + radius, labelY);
                  ctx.lineTo(labelX + labelWidth - radius, labelY);
                  ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius);
                  ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius);
                  ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight);
                  ctx.lineTo(labelX + radius, labelY + labelHeight);
                  ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius);
                  ctx.lineTo(labelX, labelY + radius);
                  ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY);
                  ctx.closePath();
                  ctx.fill();
                  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
                  ctx.textBaseline = "middle";
                  ctx.fillText(label, labelX + paddingX, labelY + labelHeight / 2 + 0.5);
                  ctx.restore();
                },
              };
              const edgeToEdgeChartAreaPlugin = {
                id: "projectOverviewProgressEdgeToEdgeChartArea",
                beforeDatasetsDraw: (chartInstance) => {
                  const ctx = chartInstance?.ctx;
                  const chartArea = chartInstance?.chartArea;
                  const progressScale = chartInstance?.scales?.progress;
                  if (!ctx || !chartArea || !progressScale) {
                    return;
                  }
                  const min = Number(progressScale.min || 0);
                  const max = Number(progressScale.max || 0);
                  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
                    return;
                  }
                  ctx.save();
                  ctx.setLineDash([5, 8]);
                  ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
                  ctx.lineWidth = 1;
                  for (let index = 1; index < 4; index += 1) {
                    const value = min + ((max - min) * index) / 4;
                    const y = progressScale.getPixelForValue(value);
                    if (!Number.isFinite(y)) {
                      continue;
                    }
                    ctx.beginPath();
                    ctx.moveTo(chartArea.left, y);
                    ctx.lineTo(chartArea.right, y);
                    ctx.stroke();
                  }
                  ctx.restore();
                },
              };
              const chartData = {
                labels,
                datasets: [
                  {
                    id: "dailyCT",
                    type: "bar",
                    label: "Cost",
                    data: dailyCtValues,
                    yAxisID: "ct",
                    backgroundColor: (context) => makeVerticalGradient(context, [
                      [0, "rgba(102, 166, 255, 0.82)"],
                      [1, "rgba(91, 103, 230, 0.64)"],
                    ], "rgba(95, 112, 230, 0.72)"),
                    borderColor: "rgba(95, 112, 230, 0.75)",
                    borderWidth: 0,
                    borderRadius: 2,
                    barPercentage: 0.72,
                    categoryPercentage: 0.86,
                    maxBarThickness: 10,
                    order: 4,
                  },
                  {
                    id: "scope",
                    type: "line",
                    label: "Scope",
                    data: seriesById.scope || [],
                    yAxisID: "progress",
                    borderColor: "rgba(160, 160, 166, 0.62)",
                    backgroundColor: "rgba(160, 160, 166, 0.16)",
                    borderWidth: 1.25,
                    fill: false,
                    pointBackgroundColor: "rgba(190, 190, 196, 0.86)",
                    pointBorderColor: "#050505",
                    pointBorderWidth: 2,
                    pointRadius: (context) => context.dataIndex === (seriesById.scope || []).length - 1 ? 5 : 0,
                    pointHoverRadius: 5,
                    tension: 0.28,
                    order: 1,
                  },
                  {
                    id: "started",
                    type: "line",
                    label: "Started",
                    data: seriesById.started || [],
                    yAxisID: "progress",
                    borderColor: "#7EFFFF",
                    backgroundColor: (context) => makeVerticalGradient(context, [
                      [0, "rgba(126, 255, 255, 0.2)"],
                      [0.62, "rgba(126, 255, 255, 0.08)"],
                      [1, "rgba(126, 255, 255, 0)"],
                    ], "rgba(126, 255, 255, 0.08)"),
                    borderWidth: 1.5,
                    fill: false,
                    pointBackgroundColor: "#7EFFFF",
                    pointBorderColor: "#050505",
                    pointBorderWidth: 2,
                    pointRadius: (context) => context.dataIndex === (seriesById.started || []).length - 1 ? 5 : 0,
                    pointHoverRadius: 5,
                    tension: 0.28,
                    order: 2,
                  },
                  {
                    id: "completed",
                    type: "line",
                    label: "Completed",
                    data: seriesById.completed || [],
                    yAxisID: "progress",
                    borderColor: "#4da3ff",
                    backgroundColor: (context) => makeVerticalGradient(context, [
                      [0, "rgba(77, 163, 255, 0.32)"],
                      [0.55, "rgba(77, 163, 255, 0.16)"],
                      [1, "rgba(77, 163, 255, 0)"],
                    ], "rgba(77, 163, 255, 0.14)"),
                    borderWidth: 1.5,
                    fill: "origin",
                    pointBackgroundColor: "#4da3ff",
                    pointBorderColor: "#050505",
                    pointBorderWidth: 2,
                    pointRadius: (context) => context.dataIndex === (seriesById.completed || []).length - 1 ? 5 : 0,
                    pointHoverRadius: 5,
                    tension: 0.28,
                    order: 3,
                  },
                ],
              };
              const chartOptions = {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                normalized: true,
                interaction: {
                  intersect: false,
                  mode: "index",
                },
                layout: {
                  padding: {
                    top: 12,
                    right: 4,
                    bottom: 0,
                    left: 0,
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(8, 8, 8, 0.96)",
                    borderColor: "rgba(255, 255, 255, 0.14)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    titleColor: "rgba(255, 255, 255, 0.94)",
                    bodyColor: "rgba(255, 255, 255, 0.78)",
                    padding: 10,
                    callbacks: {
                      label: (context) => {
                        const datasetId = context.dataset?.id || "";
                        const value = Math.max(0, Number(context.parsed?.y || 0));
                        if (datasetId === "dailyCT") {
                          return "Cost: " + formatProjectOverviewCt(value);
                        }
                        return String(context.dataset?.label || "Progress") + ": " + formatProjectOverviewInteger(value);
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    type: "category",
                    bounds: "data",
                    offset: false,
                    grid: { display: false, offset: false, drawBorder: false },
                    border: { display: false },
                    ticks: {
                      align: "inner",
                      autoSkip: false,
                      color: "rgba(255, 255, 255, 0.38)",
                      font: {
                        size: 11,
                        weight: "400",
                        family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
                      },
                      maxRotation: 0,
                      minRotation: 0,
                      padding: 10,
                      callback: (_value, index) => {
                        const bucket = dailyCtBuckets[index];
                        const key = String(bucket?.key || "");
                        const date = key ? new Date(key + "T00:00:00") : null;
                        if (longRangeTickIndexes) {
                          return longRangeTickIndexes.has(index)
                            ? (date && !Number.isNaN(date.getTime())
                              ? date.toLocaleDateString("en-US", { month: "short" })
                              : (labels[index] || ""))
                            : "";
                        }
                        if (labels.length === 30) {
                          return index === 0 || index === labels.length - 1
                            ? (labels[index] || "")
                            : "";
                        }
                        if (labels.length <= 7) {
                          return labels[index] || "";
                        }
                        if (date && !Number.isNaN(date.getTime()) && date.getDate() <= 2) {
                          return date.toLocaleDateString("en-US", { month: "short" });
                        }
                        if (index === 0 || index === labels.length - 1) {
                          return date && !Number.isNaN(date.getTime())
                            ? date.toLocaleDateString("en-US", { month: "short" })
                            : (labels[index] || "");
                        }
                        return "";
                      },
                    },
                  },
                  progress: {
                    display: false,
                    type: "linear",
                    position: "left",
                    min: 0,
                    max: Math.max(1, Math.ceil(maxProgressValue * 1.18)),
                    ticks: {
                      display: false,
                      maxTicksLimit: 4,
                    },
                    grid: {
                      display: false,
                      drawTicks: false,
                    },
                    border: { display: false },
                  },
                  ct: {
                    display: true,
                    type: "linear",
                    position: "left",
                    min: 0,
                    max: Math.max(1, Math.ceil(maxDailyCt * 1.22)),
                    ticks: {
                      display: true,
                      maxTicksLimit: 4,
                      color: "rgba(255, 255, 255, 0.34)",
                      padding: 8,
                      font: {
                        size: 11,
                        weight: "400",
                        family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
                      },
                      callback: (value) => formatProjectOverviewCt(value),
                    },
                    grid: { display: false, drawTicks: false },
                    border: { display: false },
                  },
                },
              };

              if (chartRef.current) {
                chartRef.current.data = chartData;
                chartRef.current.options = chartOptions;
                chartRef.current.update("none");
                return undefined;
              }

              chartRef.current = new Chart(canvas, {
                type: "bar",
                data: chartData,
                options: chartOptions,
                plugins: [edgeToEdgeChartAreaPlugin, hoverGuidePlugin],
              });
              return undefined;
            }, [chartSignature]);

            return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame" },
              React.createElement("canvas", {
                ref: canvasRef,
                className: "playground-project-overview-progress-combo-canvas",
                role: "img",
                "aria-label": "Project progress and daily cost",
              })
            );
          }

          function renderProjectOverviewProgressUsageChartSection() {
            const progressStats = getProjectOverviewProgressStats();
            const performanceRangeOptions = [
              { id: "5d", label: "5D", bucketCount: 5 },
              { id: "1m", label: "1M", bucketCount: 30 },
              { id: "6m", label: "6M", bucketCount: 180 },
              { id: "1y", label: "1Y", bucketCount: 365 },
            ];
            const activePerformanceRangeId = typeof projectOverviewPerformanceRange === "string"
              ? projectOverviewPerformanceRange
              : "1m";
            const activePerformanceRange = performanceRangeOptions.find((option) => option.id === activePerformanceRangeId)
              || performanceRangeOptions[2];
            const dailyCtBuckets = buildProjectOverviewDailyCtBuckets(activePerformanceRange.bucketCount);
            const series = buildProjectOverviewProgressSeriesForBuckets(dailyCtBuckets);
            const maxSeriesValue = Math.max(
              0,
              ...series.flatMap((entry) => Array.isArray(entry.values) ? entry.values : [])
                .map((value) => Math.max(0, Number(value || 0)))
            );
            const maxProgressValue = Math.max(
              1,
              progressStats.scopeCount,
              progressStats.startedCount,
              progressStats.completedCount,
              maxSeriesValue
            );
            const maxDailyCt = Math.max(1, ...dailyCtBuckets.map((bucket) => Math.max(0, Number(bucket?.totalCT || 0))));
            const totalDailyCt = dailyCtBuckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket?.totalCT || 0)), 0);
            const performanceKpis = progressStats.rows
              .map((row) => ({
                id: row.id,
                label: row.label,
                value: formatProjectOverviewInteger(row.value),
              }))
              .concat({
                id: "cost",
                label: "Cost",
                value: formatProjectOverviewCt(totalDailyCt),
              });
            const handlePerformanceRangeSelect = (nextRangeId) => {
              if (typeof setProjectOverviewPerformanceRange === "function") {
                setProjectOverviewPerformanceRange(nextRangeId);
              }
            };
            const handlePerformanceChartDownload = () => {
              if (typeof document === "undefined") {
                return;
              }
              const canvas = document.querySelector(".playground-project-overview-progress-combo-canvas");
              if (!canvas || typeof canvas.toDataURL !== "function") {
                return;
              }
              const link = document.createElement("a");
              link.href = canvas.toDataURL("image/png");
              link.download = "project-recent-performance.png";
              link.click();
            };

            return React.createElement("section", { className: "playground-project-overview-progress-combo-card" },
              React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
                React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, "Recent performance"),
                React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                  React.createElement("div", { className: "playground-project-overview-progress-combo-ranges", role: "group", "aria-label": "Performance range" },
                    performanceRangeOptions.map((option) =>
                      React.createElement("button", {
                        key: option.id,
                        type: "button",
                        className: "playground-project-overview-progress-combo-range" + (activePerformanceRange.id === option.id ? " is-active" : ""),
                        onClick: () => handlePerformanceRangeSelect(option.id),
                        "aria-pressed": activePerformanceRange.id === option.id ? "true" : "false",
                      }, option.label)
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-progress-combo-download",
                    onClick: handlePerformanceChartDownload,
                    title: "Download chart",
                    "aria-label": "Download recent performance chart",
                  }, React.createElement(Download, { width: 15, height: 15, strokeWidth: 1.8 }))
                )
              ),
              React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
                performanceKpis.map((item) =>
                  React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                    React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                      React.createElement("span", { className: "playground-project-overview-progress-combo-metric-dot is-" + item.id, "aria-hidden": "true" }),
                      React.createElement("span", null, item.label)
                    ),
                    React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                  )
                )
              ),
              React.createElement("div", { className: "playground-project-overview-progress-combo-chart" },
                React.createElement(PlaygroundProjectOverviewProgressUsageChart, {
                  dailyCtBuckets,
                  maxDailyCt,
                  maxProgressValue,
                  series,
                })
              )
            );
          }

          function renderProjectOverviewWidgetHeader(title, Icon, action) {
            return React.createElement("div", { className: "playground-project-overview-widget-header" },
              React.createElement("div", { className: "playground-project-overview-widget-title-wrap" },
                React.createElement("span", { className: "playground-project-overview-widget-icon", "aria-hidden": "true" },
                  Icon ? React.createElement(Icon, { strokeWidth: 1.8 }) : null
                ),
                React.createElement("span", { className: "playground-project-overview-widget-title" }, title)
              ),
              action ? React.createElement("button", {
                type: "button",
                className: "playground-project-overview-widget-action",
                onClick: action.onClick,
              }, action.label) : null
            );
          }

          function renderProjectOverviewWidgetListItem({ key, Icon, title, meta, onClick }) {
            const elementType = typeof onClick === "function" ? "button" : "div";
            return React.createElement(elementType, {
                key,
                type: elementType === "button" ? "button" : undefined,
                className: "playground-project-overview-widget-list-item",
                onClick,
              },
              React.createElement("span", { className: "playground-project-overview-widget-list-icon", "aria-hidden": "true" },
                Icon ? React.createElement(Icon, { strokeWidth: 1.8 }) : null
              ),
              React.createElement("span", { className: "playground-project-overview-widget-list-copy" },
                React.createElement("span", { className: "playground-project-overview-widget-list-title", title }, title),
                meta ? React.createElement("span", { className: "playground-project-overview-widget-list-meta", title: meta }, meta) : null
              )
            );
          }

          function renderProjectOverviewSetupSection() {
            const progressStats = getProjectOverviewProgressStats();
            if (progressStats.scopeCount > 0) {
              return null;
            }
            const operatingProfile = getProjectOverviewOperatingProfile();
            const setupRecipe = operatingProfile?.setupRecipe && typeof operatingProfile.setupRecipe === "object" && !Array.isArray(operatingProfile.setupRecipe)
              ? operatingProfile.setupRecipe
              : {};
            const starterTasks = Array.isArray(setupRecipe.starterTasks)
              ? setupRecipe.starterTasks
              : [];
            const firstSteps = Array.isArray(setupRecipe.firstSteps)
              ? setupRecipe.firstSteps
              : [];
            const setupSteps = (starterTasks.length ? starterTasks : firstSteps)
              .map((step) => String(step || "").trim())
              .filter(Boolean)
              .slice(0, 4);
            const recommendedResources = Array.isArray(operatingProfile?.suggestedResources)
              ? operatingProfile.suggestedResources
              : [];
            const recommendedConnectors = Array.isArray(setupRecipe.recommendedConnectors)
              ? setupRecipe.recommendedConnectors
              : [];
            const recommendationLine = recommendedConnectors.concat(recommendedResources)
              .map((item) => String(item || "").trim())
              .filter(Boolean)
              .slice(0, 3)
              .join(" · ");
            return React.createElement("section", { className: "playground-project-overview-setup-section" },
              renderProjectOverviewWidgetHeader("Project Setup", ListTodo),
              setupSteps.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    setupSteps.map((step, index) => renderProjectOverviewWidgetListItem({
                      key: "setup:" + index + ":" + step,
                      Icon: ListTodo,
                      title: step,
                      meta: index === 0 && recommendationLine ? "Recommended: " + recommendationLine : "",
                    }))
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "Run Mission Control to create the first setup plan.")
            );
          }

          function renderProjectOverviewProgressWidget() {
            const progressStats = getProjectOverviewProgressStats();
            const chartWidth = 220;
            const chartHeight = 86;
            const paddingX = 4;
            const paddingTop = 8;
            const paddingBottom = 18;
            const maxValue = Math.max(1, progressStats.scopeCount, progressStats.startedCount, progressStats.completedCount);
            const pointCount = 5;
            function makeValues(target, curve) {
              return curve.map((factor) => Math.round(Math.max(0, target) * factor));
            }
            const series = [
              { id: "scope", values: makeValues(progressStats.scopeCount, [0, 0.28, 0.48, 0.72, 1]) },
              { id: "started", values: makeValues(progressStats.startedCount, [0, 0.16, 0.55, 0.82, 1]) },
              { id: "completed", values: makeValues(progressStats.completedCount, [0, 0.08, 0.3, 0.68, 1]) },
            ];
            function getPoint(value, index) {
              const x = paddingX + (index / Math.max(1, pointCount - 1)) * (chartWidth - paddingX * 2);
              const y = paddingTop + (1 - (value / maxValue)) * (chartHeight - paddingTop - paddingBottom);
              return { x, y };
            }
            function buildPath(values) {
              return values.map((value, index) => {
                const point = getPoint(value, index);
                return (index === 0 ? "M" : "L") + point.x.toFixed(1) + " " + point.y.toFixed(1);
              }).join(" ");
            }
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Progress", ChartNoAxesColumnIncreasing),
              React.createElement("div", { className: "playground-project-overview-widget-progress-chart" },
                React.createElement("svg", {
                  className: "playground-project-overview-widget-progress-svg",
                  viewBox: "0 0 " + chartWidth + " " + chartHeight,
                  preserveAspectRatio: "none",
                  role: "img",
                  "aria-label": "Project progress by task status",
                },
                  [0.33, 0.66].map((fraction) =>
                    React.createElement("line", {
                      key: "guide:" + fraction,
                      className: "playground-project-overview-widget-progress-guide",
                      x1: paddingX,
                      x2: chartWidth - paddingX,
                      y1: paddingTop + (chartHeight - paddingTop - paddingBottom) * fraction,
                      y2: paddingTop + (chartHeight - paddingTop - paddingBottom) * fraction,
                    })
                  ),
                  React.createElement("line", {
                    className: "playground-project-overview-widget-progress-axis",
                    x1: paddingX,
                    x2: chartWidth - paddingX,
                    y1: chartHeight - paddingBottom,
                    y2: chartHeight - paddingBottom,
                  }),
                  series.map((entry) =>
                    React.createElement("path", {
                      key: entry.id,
                      className: "playground-project-overview-widget-progress-line is-" + entry.id,
                      d: buildPath(entry.values),
                    })
                  ),
                  series.map((entry) => {
                    const point = getPoint(entry.values[entry.values.length - 1] || 0, entry.values.length - 1);
                    return React.createElement("circle", {
                      key: "dot:" + entry.id,
                      className: "playground-project-overview-widget-progress-dot",
                      cx: point.x,
                      cy: point.y,
                      r: 4,
                      fill: entry.id === "completed" ? "rgb(56, 204, 164)" : entry.id === "started" ? "rgb(122, 126, 255)" : "rgba(255, 255, 255, 0.7)",
                    });
                  })
                ),
                React.createElement("div", { className: "playground-project-overview-widget-rows" },
                  progressStats.rows.map((row) =>
                    React.createElement("div", { key: row.id, className: "playground-project-overview-widget-row" },
                      React.createElement("div", { className: "playground-project-overview-widget-row-name" },
                        React.createElement("span", { className: "playground-project-overview-widget-swatch is-" + row.id }),
                        React.createElement("span", null, row.label)
                      ),
                      React.createElement("div", { className: "playground-project-overview-widget-row-percent" }, row.percent + "%"),
                      React.createElement("div", { className: "playground-project-overview-widget-row-value" }, row.value)
                    )
                  )
                )
              )
            );
          }

          function renderProjectOverviewCostWidget() {
            const visibleBuckets = projectThreadTimeline.slice(-10);
            const maxBucketTotal = Math.max(1, ...visibleBuckets.map((bucket) => Math.max(0, Number(bucket?.totalCT || 0))));
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Cost Observability", Coins, {
                label: "Details",
                onClick: () => typeof setProjectOverviewHomeTab === "function" && setProjectOverviewHomeTab("general"),
              }),
              React.createElement("div", { className: "playground-project-overview-cost-widget-main" },
                React.createElement("div", { className: "playground-project-overview-cost-widget-value" }, formatProjectOverviewCt(projectTotalCt)),
                React.createElement("div", { className: "playground-project-overview-cost-widget-label" }, "Spent on project"),
                projectHasCostData
                  ? React.createElement("div", { className: "playground-project-overview-cost-widget-bars", "aria-label": "Project cost by resource type" },
                      visibleBuckets.map((bucket, bucketIndex) => {
                        const total = Math.max(0, Number(bucket?.totalCT || 0));
                        return React.createElement("div", {
                            key: String(bucket?.key || bucketIndex),
                            className: "playground-project-overview-cost-widget-bar",
                            title: String(bucket?.label || "") + " · " + formatProjectOverviewAxisCt(total),
                          },
                          projectComputeSeries.map((entry) => {
                            const rawValue = Math.max(0, Number(entry.values[projectThreadTimeline.length - visibleBuckets.length + bucketIndex] || 0));
                            if (rawValue <= 0 || total <= 0) {
                              return null;
                            }
                            return React.createElement("span", {
                              key: entry.id,
                              className: "playground-project-overview-cost-widget-segment",
                              style: {
                                height: Math.max(1, (rawValue / maxBucketTotal) * 100) + "%",
                                background: entry.color,
                              },
                            });
                          })
                        );
                      })
                    )
                  : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No project cost yet.")
              )
            );
          }

          function getProjectOverviewResourceHaystack(resource) {
            return [
              resource?.type,
              resource?.kind,
              resource?.resourceType,
              resource?.resourceKind,
              resource?.serverKind,
              resource?.title,
              resource?.name,
              resource?.label,
            ].join(" ").toLowerCase();
          }

          function isProjectOverviewMetronomeResource(resource) {
            const haystack = getProjectOverviewResourceHaystack(resource);
            return haystack.includes("metronome") || haystack.includes("schedule") || haystack.includes("cron");
          }

          function isProjectOverviewWebAppResource(resource) {
            const haystack = getProjectOverviewResourceHaystack(resource);
            return haystack.includes("web app")
              || haystack.includes("web-app")
              || haystack.includes("web_app")
              || haystack.includes("webapp")
              || haystack.includes("frontend app")
              || haystack.includes("hosted app");
          }

          function isProjectOverviewDatabaseResource(resource) {
            const haystack = getProjectOverviewResourceHaystack(resource);
            return haystack.includes("database")
              || haystack.includes("datastore")
              || haystack.includes("data store")
              || haystack.includes("firestore")
              || haystack.includes("postgres");
          }

          function renderProjectOverviewMetronomesWidget() {
            const metronomeResources = allOverviewResourceItems.filter((item) => isProjectOverviewMetronomeResource(item)).slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Metronomes", Metronome, {
                label: "Open",
                onClick: () => typeof onOpenProjectMetronomes === "function" && onOpenProjectMetronomes({ projectId: normalizedSelectedProjectId }),
              }),
              metronomeResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    metronomeResources.map((resource, index) => {
                      const title = String(resource?.title || resource?.name || resource?.label || "Metronome").trim();
                      const meta = [resource?.status || "", resource?.dateLabel || resource?.updatedAt || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(resource?.id || title || index),
                        Icon: Metronome,
                        title,
                        meta,
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No project metronomes yet.")
            );
          }

          function renderProjectOverviewFilesWidget() {
            const visibleFiles = filteredProjectFileActivityItems.slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Files", FolderOpen, {
                label: "Open",
                onClick: () => {
                  if (typeof onOpenFilesPage !== "function") return;
                  onOpenFilesPage({
                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    projectId: normalizedSelectedProjectId,
                    environmentId: activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                  });
                },
              }),
              visibleFiles.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    visibleFiles.map((row, index) => {
                      const title = String(row?.title || row?.path || "Untitled file").trim();
                      const meta = [row?.operation || "Modified", row?.dateLabel || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(row?.id || row?.path || title || index),
                        Icon: FolderOpen,
                        title,
                        meta,
                        onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(row),
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No project file activity yet.")
            );
          }

          function renderProjectOverviewResourcesWidget() {
            const metronomeResources = allOverviewResourceItems
              .filter((item) => isProjectOverviewMetronomeResource(item))
              .map((resource, index) => {
                const title = String(resource?.title || resource?.name || resource?.label || "Metronome").trim();
                return {
                  key: "metronome:" + String(resource?.id || title || index),
                  Icon: Metronome,
                  title,
                  meta: [resource?.status || "Metronome", resource?.dateLabel || resource?.updatedAt || ""].filter(Boolean).join(" · "),
                  onClick: () => typeof onOpenProjectMetronomes === "function" && onOpenProjectMetronomes({ projectId: normalizedSelectedProjectId }),
                };
              });
            const serverResources = overviewResourceItems
              .filter((item) => !isProjectOverviewMetronomeResource(item))
              .map((resource, index) => {
                const title = String(resource?.title || resource?.name || resource?.label || "Resource").trim();
                return {
                  key: "server:" + String(resource?.id || title || index),
                  Icon: Server,
                  title,
                  meta: [resource?.type || resource?.kind || resource?.resourceType || "Server resource", resource?.status || ""].filter(Boolean).join(" · "),
                  onClick: () => {
                    if (typeof setProjectOverviewHomeTab === "function") {
                      setProjectOverviewHomeTab("resources");
                    }
                    if (typeof setProjectOverviewFilesSubview === "function") {
                      setProjectOverviewFilesSubview("resources");
                    }
                  },
                };
              });
            const imagineResources = projectOverviewImagineResources.map((resource, index) => {
              const resourcePath = String(resource?.path || resource?.sourcePath || resource?.workspacePath || "").trim();
              const title = String(resource?.title || resource?.filename || getHistoryPathName(resourcePath) || "Untitled visual").trim();
              const candidate = [resource?.mimeType, resource?.contentType, resource?.type, resource?.fileType, resourcePath, title].join(" ");
              const isVideoResource = /^video\//i.test(String(candidate || "")) || /\.(m4v|mkv|mov|mp4|webm)$/i.test(String(candidate || ""));
              return {
                key: "imagine:" + String(resource?.id || resourcePath || title || index),
                Icon: isVideoResource ? Film : ImageIcon,
                title,
                meta: [isVideoResource ? "Video" : "Image", resource?.dateLabel || ""].filter(Boolean).join(" · "),
                onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(resource),
              };
            });
            const combinedResources = []
              .concat(metronomeResources)
              .concat(serverResources)
              .concat(imagineResources);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Resources", Server, {
                label: "Open",
                onClick: () => {
                  if (typeof setProjectOverviewHomeTab === "function") {
                    setProjectOverviewHomeTab("resources");
                  }
                  if (typeof setProjectOverviewFilesSubview === "function") {
                    setProjectOverviewFilesSubview("resources");
                  }
                },
              }),
              combinedResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    combinedResources.map((resource) => renderProjectOverviewWidgetListItem(resource))
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No project resources yet.")
            );
          }

          function renderProjectOverviewServerResourcesWidget() {
            const visibleResources = overviewResourceItems.filter((item) => !isProjectOverviewMetronomeResource(item)).slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Server Resources", Server, {
                label: "Open",
                onClick: () => {
                  if (typeof setProjectOverviewHomeTab === "function") {
                    setProjectOverviewHomeTab("resources");
                  }
                  if (typeof setProjectOverviewFilesSubview === "function") {
                    setProjectOverviewFilesSubview("resources");
                  }
                },
              }),
              visibleResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    visibleResources.map((resource, index) => {
                      const title = String(resource?.title || resource?.name || resource?.label || "Resource").trim();
                      const meta = [resource?.type || resource?.kind || resource?.resourceType || "Resource", resource?.status || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(resource?.id || title || index),
                        Icon: Server,
                        title,
                        meta,
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No server resources yet.")
            );
          }

          function renderProjectOverviewImagineWidget() {
            const visibleImagineResources = projectOverviewImagineResources.slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Imagine Resources", Clapperboard, {
                label: "Open",
                onClick: () => {
                  if (typeof setProjectOverviewHomeTab === "function") {
                    setProjectOverviewHomeTab("resources");
                  }
                  if (typeof setProjectOverviewFilesSubview === "function") {
                    setProjectOverviewFilesSubview("imagine");
                  }
                },
              }),
              visibleImagineResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    visibleImagineResources.map((resource, index) => {
                      const resourcePath = String(resource?.path || resource?.sourcePath || resource?.workspacePath || "").trim();
                      const title = String(resource?.title || resource?.filename || getHistoryPathName(resourcePath) || "Untitled visual").trim();
                      const candidate = [resource?.mimeType, resource?.contentType, resource?.type, resource?.fileType, resourcePath, title].join(" ");
                      const isVideoResource = /^video\//i.test(String(candidate || "")) || /\.(m4v|mkv|mov|mp4|webm)$/i.test(String(candidate || ""));
                      const meta = [isVideoResource ? "Video" : "Image", resource?.dateLabel || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(resource?.id || resourcePath || title || index),
                        Icon: isVideoResource ? Film : ImageIcon,
                        title,
                        meta,
                        onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(resource),
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No imagine resources yet.")
            );
          }

          function renderProjectOverviewUsersWidget() {
            const summary = selectedProjectSummary && typeof selectedProjectSummary === "object" && !Array.isArray(selectedProjectSummary)
              ? selectedProjectSummary
              : {};
            const activeUsers = Math.max(0, Number(summary.activeUsers || summary.activeUsersCount || summary.usersCount || summary.dau || 0));
            const totalUsers = Math.max(activeUsers, Number(summary.totalUsers || summary.totalUsersCount || summary.usersCount || 0));
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Users", UsersRound),
              React.createElement("div", { className: "playground-project-overview-widget-metric" },
                React.createElement("div", { className: "playground-project-overview-widget-metric-value" }, formatProjectOverviewInteger(activeUsers)),
                React.createElement("div", { className: "playground-project-overview-widget-metric-label" }, "Daily active users"),
                totalUsers > 0
                  ? React.createElement("div", { className: "playground-project-overview-widget-metric-meta" }, formatProjectOverviewInteger(totalUsers) + " total users")
                  : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No user activity yet.")
              )
            );
          }

          function isProjectOverviewFunctionResource(resource) {
            const haystack = getProjectOverviewResourceHaystack(resource);
            return haystack.includes("function") || haystack.includes("server action") || haystack.includes("backend logic");
          }

          function renderProjectOverviewFunctionsWidget() {
            const functionResources = allOverviewResourceItems
              .filter((item) => isProjectOverviewFunctionResource(item))
              .slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Functions", FunctionSquare, {
                label: "Open",
                onClick: () => {
                  if (typeof setProjectOverviewHomeTab === "function") {
                    setProjectOverviewHomeTab("resources");
                  }
                  if (typeof setProjectOverviewFilesSubview === "function") {
                    setProjectOverviewFilesSubview("resources");
                  }
                },
              }),
              functionResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    functionResources.map((resource, index) => {
                      const title = String(resource?.title || resource?.name || resource?.label || "Function").trim();
                      const meta = [resource?.status || "", resource?.dateLabel || resource?.updatedAt || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(resource?.id || title || index),
                        Icon: FunctionSquare,
                        title,
                        meta,
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No functions connected yet.")
            );
          }

          function renderProjectOverviewEarningsWidget() {
            const summary = selectedProjectSummary && typeof selectedProjectSummary === "object" && !Array.isArray(selectedProjectSummary)
              ? selectedProjectSummary
              : {};
            const earningsValue = Math.max(0, Number(summary.earnings || summary.revenue || summary.totalRevenue || summary.paymentsTotal || 0));
            const formattedValue = earningsValue > 0
              ? "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: earningsValue >= 100 ? 0 : 2 }).format(earningsValue)
              : "$0";
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Earnings", DollarSign),
              React.createElement("div", { className: "playground-project-overview-widget-metric" },
                React.createElement("div", { className: "playground-project-overview-widget-metric-value" }, formattedValue),
                React.createElement("div", { className: "playground-project-overview-widget-metric-label" }, "Payment revenue"),
                earningsValue > 0
                  ? React.createElement("div", { className: "playground-project-overview-widget-metric-meta" }, "From connected payment resources")
                  : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No earnings recorded yet.")
              )
            );
          }

          function getProjectOverviewOperatingProfile() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            if (metadata.operatingProfileSnapshot && typeof metadata.operatingProfileSnapshot === "object" && !Array.isArray(metadata.operatingProfileSnapshot)) {
              return metadata.operatingProfileSnapshot;
            }
            const projectType = String(selectedProject?.projectType || selectedProject?.type || metadata.projectType || metadata.blueprintId || "blank").trim();
            const blueprint = typeof getPlaygroundProjectBlueprint === "function"
              ? getPlaygroundProjectBlueprint(projectType)
              : null;
            if (blueprint && typeof buildPlaygroundProjectOperatingProfileSnapshot === "function") {
              return buildPlaygroundProjectOperatingProfileSnapshot(blueprint);
            }
            return null;
          }

          function getProjectOverviewDashboardWidgetIds() {
            const operatingProfile = getProjectOverviewOperatingProfile();
            const dashboardProfile = operatingProfile?.dashboardProfile && typeof operatingProfile.dashboardProfile === "object" && !Array.isArray(operatingProfile.dashboardProfile)
              ? operatingProfile.dashboardProfile
              : {};
            const configuredWidgets = Array.isArray(dashboardProfile.widgets)
              ? dashboardProfile.widgets
              : [];
            const normalizedWidgets = configuredWidgets
              .map((widgetId) => String(widgetId || "").trim().toLowerCase().replace(/[\\s_-]+/g, "-"))
              .filter(Boolean);
            const fallbackWidgets = ["progress", "files", "resources", "cost"];
            const allowedWidgets = new Set(["progress", "cost", "files", "resources", "metronomes", "server-resources", "imagine-resources", "users", "functions", "earnings"]);
            const seen = new Set();
            const widgetIds = (normalizedWidgets.length ? normalizedWidgets : fallbackWidgets)
              .map((widgetId) => {
                if (["project-progress", "scope"].includes(widgetId)) return "progress";
                if (["costs", "cost-observability", "usage"].includes(widgetId)) return "cost";
                if (["file", "workspace-files"].includes(widgetId)) return "files";
                if (["resource", "execution-resources"].includes(widgetId)) return "resources";
                if (["setup", "setup-guide", "project-setup", "setup-recipe"].includes(widgetId)) return "";
                if (["dau", "daily-active-users", "active-users"].includes(widgetId)) return "users";
                if (["function", "server-functions", "function-activity"].includes(widgetId)) return "functions";
                if (["revenue", "payments", "payment-earnings"].includes(widgetId)) return "earnings";
                return widgetId;
              })
              .filter(Boolean)
              .filter((widgetId) => {
                if (!allowedWidgets.has(widgetId)) {
                  return false;
                }
                if (seen.has(widgetId)) {
                  return false;
                }
                seen.add(widgetId);
                return true;
              });
            return widgetIds.length ? widgetIds : fallbackWidgets;
          }

          function renderProjectOverviewWidgetById(widgetId) {
            switch (widgetId) {
              case "progress":
                return renderProjectOverviewProgressWidget();
              case "cost":
                return renderProjectOverviewCostWidget();
              case "files":
                return renderProjectOverviewFilesWidget();
              case "resources":
                return renderProjectOverviewResourcesWidget();
              case "metronomes":
                return renderProjectOverviewMetronomesWidget();
              case "server-resources":
                return renderProjectOverviewServerResourcesWidget();
              case "imagine-resources":
                return renderProjectOverviewImagineWidget();
              case "users":
                return renderProjectOverviewUsersWidget();
              case "functions":
                return renderProjectOverviewFunctionsWidget();
              case "earnings":
                return renderProjectOverviewEarningsWidget();
              default:
                return null;
            }
          }

          function renderProjectOverviewWidgetSection() {
            const widgets = getProjectOverviewDashboardWidgetIds()
              .map(renderProjectOverviewWidgetById)
              .filter(Boolean);
            return React.createElement("div", { className: "playground-project-overview-widget-grid" }, ...widgets);
          }

          function getProjectOverviewReadableText(value) {
            if (value == null) return "";
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
              return String(value).trim();
            }
            if (Array.isArray(value)) {
              return value.map(getProjectOverviewReadableText).filter(Boolean).join("\n").trim();
            }
            if (typeof value === "object") {
              const candidates = [
                value.body,
                value.text,
                value.message,
                value.content,
                value.summary,
                value.description,
                value.note,
                value.update,
                value.markdown,
                value.plainText,
                value.goal,
                value.title,
                value.name,
                value.latestUpdate,
                value.statusUpdate,
                value.scopeUpdate,
                value.projectUpdate,
              ];
              for (const candidate of candidates) {
                const text = getProjectOverviewReadableText(candidate);
                if (text) return text;
              }
            }
            return "";
          }

          function normalizeProjectOverviewLatestUpdateRecord(value) {
            if (value == null) return null;
            if (typeof value === "string") {
              const body = value.trim();
              return body ? { body } : null;
            }
            if (typeof value !== "object" || Array.isArray(value)) {
              return null;
            }
            const body = getProjectOverviewReadableText(
              value.body
                || value.text
                || value.message
                || value.content
                || value.summary
                || value.description
                || value.note
                || value.update
                || value.markdown
                || value.plainText
                || value.goal
                || value.title
                || value.name
                || ""
            );
            const timestamp = String(
              value.updatedAt
                || value.createdAt
                || value.timestamp
                || value.date
                || ""
            ).trim();
            const authorName = String(
              value.authorName
                || value.actorName
                || value.userName
                || value.name
                || value.author?.name
                || value.actor?.name
                || ""
            ).trim();
            const authorAvatarUrl = String(
              value.authorAvatarUrl
                || value.actorAvatarUrl
                || value.avatarUrl
                || value.photoUrl
                || value.author?.avatarUrl
                || value.actor?.avatarUrl
                || ""
            ).trim();
            if (!body && !timestamp && !authorName && !authorAvatarUrl) {
              return null;
            }
            return {
              body,
              timestamp,
              authorName,
              authorAvatarUrl,
            };
          }

          function collectProjectOverviewLatestUpdateRecords() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const summary = selectedProjectSummary && typeof selectedProjectSummary === "object" && !Array.isArray(selectedProjectSummary)
              ? selectedProjectSummary
              : {};
            const rawCandidates = [
              selectedProject?.latestUpdate,
              selectedProject?.statusUpdate,
              selectedProject?.scopeUpdate,
              selectedProject?.projectUpdate,
              metadata.latestUpdate,
              metadata.statusUpdate,
              metadata.scopeUpdate,
              metadata.projectUpdate,
              summary.latestUpdate,
              summary.statusUpdate,
              summary.scopeUpdate,
              summary.projectUpdate,
            ];
            [
              selectedProject?.updates,
              selectedProject?.projectUpdates,
              selectedProject?.statusUpdates,
              selectedProject?.comments,
              metadata.updates,
              metadata.projectUpdates,
              metadata.statusUpdates,
              metadata.comments,
              summary.updates,
              summary.projectUpdates,
              summary.statusUpdates,
            ].forEach((collection) => {
              if (Array.isArray(collection)) {
                collection.forEach((entry) => rawCandidates.push(entry));
              }
            });
            return rawCandidates
              .map(normalizeProjectOverviewLatestUpdateRecord)
              .filter(Boolean)
              .sort((left, right) => {
                const leftTime = Date.parse(left.timestamp || "");
                const rightTime = Date.parse(right.timestamp || "");
                return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
              });
          }

          function getProjectOverviewLatestUpdateTimestamp(...values) {
            for (const value of values) {
              const raw = String(value || "").trim();
              if (!raw) continue;
              const parsed = Date.parse(raw);
              if (Number.isFinite(parsed)) {
                return { timestamp: raw, time: parsed };
              }
            }
            return { timestamp: "", time: 0 };
          }

          function buildProjectOverviewLatestUpdateActivityRecords() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const lead = getProjectOverviewSidebarLead();
            const records = [];
            const pushRecord = (record) => {
              const body = getProjectOverviewReadableText(record?.body);
              if (!body) return;
              records.push({
                body,
                timestamp: String(record?.timestamp || "").trim(),
                time: Number.isFinite(Number(record?.time)) ? Number(record.time) : 0,
                authorName: String(record?.authorName || lead.name || "Project lead").trim(),
                authorAvatarUrl: String(record?.authorAvatarUrl || lead.avatarUrl || "").trim(),
              });
            };

            buildProjectOverviewActivityItems()
              .filter((item) => item?.task || item?.taskId)
              .forEach((item) => {
                const task = item?.task || {};
                const timestampInfo = getProjectOverviewLatestUpdateTimestamp(task.updatedAt, task.createdAt);
                const verb = String(item?.verb || "").trim() || "updated";
                pushRecord({
                  body: [item?.actor || "Agent", verb, "ticket", item?.object || task.title || "Untitled task"].filter(Boolean).join(" "),
                  timestamp: timestampInfo.timestamp,
                  time: timestampInfo.time || Number(item?.time || 0),
                  authorName: item?.actor,
                  authorAvatarUrl: item?.photoUrl,
                });
              });

            Object.values(releasesById || {}).forEach((release) => {
              const name = String(release?.name || release?.title || "").trim();
              if (!name) return;
              const timestampInfo = getProjectOverviewLatestUpdateTimestamp(release.updatedAt, release.createdAt, release.timestamp);
              if (!timestampInfo.time) return;
              const isCreated = String(release?.createdAt || "").trim()
                && String(release?.createdAt || "").trim() === String(release?.updatedAt || "").trim();
              pushRecord({
                body: (isCreated ? "Created milestone " : "Updated milestone ") + name,
                timestamp: timestampInfo.timestamp,
                time: timestampInfo.time,
              });
            });

            const strategyTimestamp = getProjectOverviewLatestUpdateTimestamp(
              metadata.strategyUpdatedAt,
              metadata.missionControlUpdatedAt,
              selectedProjectMissionControl?.updatedAt,
              selectedProjectMissionControl?.createdAt
            );
            if (String(missionControlDocumentDraft || selectedProjectMissionControl?.document || "").trim() && strategyTimestamp.time) {
              pushRecord({
                body: "Updated project strategy",
                timestamp: strategyTimestamp.timestamp,
                time: strategyTimestamp.time,
              });
            }

            const rulesTimestamp = getProjectOverviewLatestUpdateTimestamp(
              metadata.rulesUpdatedAt,
              metadata.projectRulesUpdatedAt,
              selectedProject?.rulesUpdatedAt
            );
            const ruleEntries = typeof splitPlaygroundProjectRuleEntries === "function"
              ? splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules)
              : [];
            if (ruleEntries.length > 0 && rulesTimestamp.time) {
              pushRecord({
                body: "Updated project rules",
                timestamp: rulesTimestamp.timestamp,
                time: rulesTimestamp.time,
              });
            }

            const strategyBrief = typeof normalizePlaygroundProjectStrategyBrief === "function"
              ? normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft)
              : { outcomes: [] };
            const outcomesTimestamp = getProjectOverviewLatestUpdateTimestamp(
              metadata.outcomesUpdatedAt,
              metadata.strategyUpdatedAt,
              metadata.missionControlUpdatedAt,
              selectedProjectMissionControl?.updatedAt
            );
            if (Array.isArray(strategyBrief?.outcomes) && strategyBrief.outcomes.length > 0 && outcomesTimestamp.time) {
              pushRecord({
                body: "Updated project outcomes",
                timestamp: outcomesTimestamp.timestamp,
                time: outcomesTimestamp.time,
              });
            }

            return records.sort((left, right) => (right.time || 0) - (left.time || 0));
          }

          function getProjectOverviewLatestUpdateInfo() {
            const lead = getProjectOverviewSidebarLead();
            const latestRecord = collectProjectOverviewLatestUpdateRecords()
              .map((record) => ({
                ...record,
                body: getProjectOverviewReadableText(record?.body),
                time: Date.parse(String(record?.timestamp || "")),
              }))
              .filter((record) => record.body)
              .concat(buildProjectOverviewLatestUpdateActivityRecords())
              .sort((left, right) => {
                const leftTime = Number.isFinite(left.time) ? left.time : 0;
                const rightTime = Number.isFinite(right.time) ? right.time : 0;
                return rightTime - leftTime;
              })[0] || null;
            const body = getProjectOverviewReadableText(latestRecord?.body);
            if (!body) {
              return null;
            }
            const timestamp = String(latestRecord?.timestamp || "").trim();
            const timeLabel = timestamp && typeof formatRelativeThreadTime === "function"
              ? (formatRelativeThreadTime(timestamp) || "")
              : "";
            const actorName = latestRecord?.authorName || lead.name || "Project lead";
            const actorAvatarUrl = latestRecord?.authorAvatarUrl || lead.avatarUrl || "";
            const progressStats = getProjectOverviewProgressStats();
            const healthLabel = progressStats.scopeCount > 0 && progressStats.completedCount >= progressStats.scopeCount
              ? "Complete"
              : "On track";
            return {
              actorName,
              actorAvatarUrl,
              body,
              healthLabel,
              timeLabel,
            };
          }

          function renderProjectOverviewLatestUpdateSection() {
            const update = getProjectOverviewLatestUpdateInfo();
            const updateBody = getProjectOverviewReadableText(update?.body);
            if (!update || !updateBody) {
              return null;
            }
            return React.createElement("section", { className: "playground-project-overview-latest-update-card" },
              React.createElement("div", { className: "playground-project-overview-latest-update-header" },
                React.createElement("h2", { className: "playground-project-overview-latest-update-title" }, "Latest update"),
                typeof openProjectComposerForEdit === "function"
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-latest-update-button",
                      onClick: () => openProjectComposerForEdit(selectedProject),
                    },
                      React.createElement(SquarePen, { className: "playground-project-overview-latest-update-button-icon", strokeWidth: 1.8 }),
                      React.createElement("span", null, "Update")
                    )
                  : null
              ),
              React.createElement("div", { className: "playground-project-overview-latest-update-meta" },
                React.createElement("span", { className: "playground-project-overview-latest-update-status" },
                  React.createElement(CircleCheckBig, { className: "playground-project-overview-latest-update-status-icon", strokeWidth: 2 }),
                  React.createElement("span", null, update.healthLabel)
                ),
                React.createElement("span", { className: "playground-project-overview-latest-update-author" },
                  renderProjectOverviewSidebarAvatar(update.actorName, update.actorAvatarUrl),
                  React.createElement("span", null, update.actorName)
                ),
                update.timeLabel
                  ? React.createElement("span", { className: "playground-project-overview-latest-update-time" }, update.timeLabel)
                  : null
              ),
              React.createElement("p", { className: "playground-project-overview-latest-update-body" }, updateBody),
              React.createElement("div", { className: "playground-project-overview-latest-update-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-latest-update-icon-button",
                  "aria-label": "Comment on latest update",
                }, React.createElement(MessageCircle, { className: "playground-project-overview-latest-update-icon", strokeWidth: 1.8 })),
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-latest-update-icon-button",
                  "aria-label": "React to latest update",
                }, React.createElement(Plus, { className: "playground-project-overview-latest-update-icon", strokeWidth: 1.8 }))
              )
            );
          }

          function renderProjectOverviewGeneralGoalSection() {
            const goalText = getProjectOverviewReadableText(projectOverviewDraft?.description || projectOverviewGoal);
            return React.createElement("section", { className: "playground-project-overview-general-goal" },
              React.createElement("h2", { className: "playground-project-overview-general-goal-title" }, "Project Goal"),
              React.createElement("p", {
                className: "playground-project-overview-general-goal-text" + (goalText ? "" : " is-empty"),
              }, goalText || "No project goal set yet.")
            );
          }

          function openProjectOverviewResourceRow(row) {
            if (row?.kind === "template") {
              openProjectOverviewTemplate(row.template || row.record || {});
              return;
            }
            const type = String(row?.type || "").trim();
            if (type === "file" || type === "imagine") {
              const record = row?.record || {};
              const normalizedPath = normalizeHistoryPath(row?.path || record?.sourcePath || record?.workspacePath || record?.path || "");
              if (normalizedPath && typeof navigateProjectOverviewFileToFiles === "function") {
                navigateProjectOverviewFileToFiles({
                  ...record,
                  path: normalizedPath,
                  title: row?.title || getHistoryPathName(normalizedPath) || "Untitled file",
                  environmentId: record?.environmentId || activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                  projectId: normalizedSelectedProjectId,
                });
                return;
              }
            }
            if (typeof setProjectOverviewHomeTab === "function") {
              setProjectOverviewHomeTab("resources");
            }
            if (typeof setProjectOverviewFilesSubview === "function") {
              const meta = getProjectOverviewResourceTypeMeta(type);
              setProjectOverviewFilesSubview(meta.subview || "resources");
            }
          }

          function openProjectOverviewTemplate(template) {
            if (typeof onOpenResourceTemplatesPage === "function") {
              onOpenResourceTemplatesPage({
                type: template?.type || "all",
                templateId: template?.id || "",
              });
            }
          }

          function renderProjectOverviewTemplateCard(template) {
            const Icon = getProjectOverviewResourceTemplateIcon(template?.type);
            return React.createElement("button", {
                key: String(template?.id || template?.title || ""),
                type: "button",
                className: "playground-project-resource-template-card",
                onClick: () => openProjectOverviewTemplate(template),
              },
              React.createElement("span", { className: "playground-project-resource-template-card-icon" },
                React.createElement(Icon, { width: 17, height: 17, strokeWidth: 1.9 })
              ),
              React.createElement("span", { className: "playground-project-resource-template-card-title" }, template?.title || "Template"),
              React.createElement("span", { className: "playground-project-resource-template-card-copy" }, template?.summary || template?.description || "Publish this template to the project.")
            );
          }

          function openProjectOverviewNewResource(type) {
            const normalizedType = String(type || "").trim();
            if (!normalizedType) {
              return;
            }
            if (typeof setProjectOverviewResourceToolbarPopover === "function") {
              setProjectOverviewResourceToolbarPopover("");
            }
            if (normalizedType === "file") {
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
              return;
            }
            if (typeof setProjectOverviewHomeTab === "function") {
              setProjectOverviewHomeTab("resources");
            }
            if (typeof setProjectOverviewFilesSubview === "function") {
              const meta = getProjectOverviewResourceTypeMeta(normalizedType);
              setProjectOverviewFilesSubview(meta.subview || "resources");
            }
          }

          function renderProjectOverviewRecommendedTemplatesEmptyState() {
            return React.createElement("div", { className: "playground-project-resources-empty has-templates" },
              React.createElement("section", { className: "playground-project-resource-template-section" },
                React.createElement("div", { className: "playground-project-resource-template-header" },
                  React.createElement("div", null,
                    React.createElement("h3", { className: "playground-project-resource-template-title" }, "Recommended templates"),
                    React.createElement("p", { className: "playground-project-resource-template-copy" }, "Start with resources that fit this project type, then publish them into the project when they are ready.")
                  )
                ),
                projectOverviewRecommendedTemplates.length > 0
                  ? React.createElement("div", { className: "playground-project-resource-template-grid" },
                      projectOverviewRecommendedTemplates.map((template) => renderProjectOverviewTemplateCard(template))
                    )
                  : React.createElement("div", { className: "playground-project-resources-empty" }, "No recommended templates available yet."),
                React.createElement("div", { className: "playground-project-resource-template-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-resource-template-browse-button",
                    onClick: () => typeof onOpenResourceTemplatesPage === "function" && onOpenResourceTemplatesPage({ type: "all" }),
                  },
                    React.createElement(Layers, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", { className: "playground-project-overview-summary-mission-label" }, "Browse all templates")
                  )
                )
              )
            );
          }

          function renderProjectOverviewResourceNewMenu() {
            if (projectOverviewResourceToolbarPopover !== "new") {
              return null;
            }
            const resourceTypes = projectOverviewResourceTypeFilters.filter((type) => String(type?.id || "") !== "all");
            return React.createElement("div", {
                className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-project-resources-new-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                onClick: (event) => event.stopPropagation(),
              },
              resourceTypes.map((type) => {
                const meta = getProjectOverviewResourceTypeMeta(type.id);
                const Icon = meta.Icon || Layers;
                return React.createElement("button", {
                    key: type.id,
                    type: "button",
                    className: "tb-popup-row playground-project-team-menu-item",
                    onClick: () => openProjectOverviewNewResource(type.id),
                  },
                  React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, type.label || meta.label || type.id)
                );
              }),
              React.createElement("div", { className: "playground-project-resources-menu-divider" }),
              React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row playground-project-team-menu-item",
                  onClick: () => {
                    if (typeof setProjectOverviewResourceToolbarPopover === "function") {
                      setProjectOverviewResourceToolbarPopover("");
                    }
                    if (typeof onOpenResourceTemplatesPage === "function") {
                      onOpenResourceTemplatesPage({ type: "all" });
                    }
                  },
                },
                React.createElement(Layers, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Templates")
              )
            );
          }

          function renderProjectOverviewResourceFilterMenu() {
            if (projectOverviewResourceToolbarPopover !== "filter") {
              return null;
            }
            return React.createElement("div", {
                className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-project-resources-filter-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                onClick: (event) => event.stopPropagation(),
              },
              projectOverviewResourceTypeFilters.map((type) =>
                renderProjectOverviewTaskToolbarOption({
                  option: { id: type.id, label: type.label || type.id },
                  active: String(projectOverviewResourceFilter || "all") === String(type.id),
                  onClick: () => {
                    setProjectOverviewResourceFilter(String(type.id || "all"));
                    if (typeof setProjectOverviewResourceToolbarPopover === "function") {
                      setProjectOverviewResourceToolbarPopover("");
                    }
                  },
                })
              )
            );
          }

          function getProjectOverviewResourceRowMenuId(row) {
            return "resource:" + String(row?.key || row?.id || row?.path || row?.title || "").trim();
          }

          function closeProjectOverviewResourceMenu() {
            if (typeof setProjectOverviewResourceMenuId === "function") {
              setProjectOverviewResourceMenuId("");
            }
          }

          function getProjectOverviewResourceRowEnvironmentId(row) {
            return String(
              row?.record?.environmentId
              || row?.environmentId
              || selectedProject?.defaultEnvironmentId
              || activeProjectAttachmentEnvironmentId
              || ""
            ).trim();
          }

          function getProjectOverviewResourceRowPath(row) {
            return normalizeHistoryPath(
              row?.path
              || row?.record?.sourcePath
              || row?.record?.workspacePath
              || row?.record?.path
              || ""
            );
          }

          async function removeProjectOverviewTemplateResource(row) {
            const rowKey = String(row?.key || "").trim();
            const templateId = String(
              row?.record?.templateId
              || row?.record?.id
              || row?.template?.templateId
              || row?.template?.id
              || ""
            ).trim();
            const nextTemplates = projectOverviewPublishedTemplates.filter((item, index) => {
              const itemTemplateId = String(item?.templateId || item?.id || "").trim();
              if (templateId) {
                return itemTemplateId !== templateId;
              }
              return "template:" + (itemTemplateId || String(item?.type || "file").trim() + ":" + index) !== rowKey;
            });
            await persistProjectOverviewSidebarProjectUpdate({}, { resourceTemplates: nextTemplates });
          }

          async function removeProjectOverviewAttachmentResource(row) {
            const rowAttachmentId = String(row?.record?.id || row?.id || "").trim();
            const rowPath = getProjectOverviewResourceRowPath(row);
            const rowEnvironmentId = getProjectOverviewResourceRowEnvironmentId(row);
            const currentAttachments = normalizePlaygroundTaskAttachmentList(projectOverviewDraft?.attachments || selectedProject?.attachments);
            const nextAttachments = currentAttachments.filter((attachment) => {
              const attachmentId = String(attachment?.id || "").trim();
              const attachmentEnvironmentId = String(attachment?.environmentId || "").trim();
              const attachmentPath = normalizeHistoryPath(attachment?.sourcePath || attachment?.workspacePath || attachment?.path || "");
              if (rowAttachmentId && attachmentId === rowAttachmentId) {
                return false;
              }
              if (rowPath && attachmentPath === rowPath && (!rowEnvironmentId || !attachmentEnvironmentId || attachmentEnvironmentId === rowEnvironmentId)) {
                return false;
              }
              return true;
            });
            await persistProjectOverviewSidebarProjectUpdate(
              { attachments: nextAttachments },
              { attachments: nextAttachments }
            );
          }

          async function removeProjectOverviewFileActivityResource(row) {
            const rowPath = getProjectOverviewResourceRowPath(row);
            const rowEnvironmentId = getProjectOverviewResourceRowEnvironmentId(row);
            const suppressedFileKey = normalizedSelectedProjectId && rowEnvironmentId && rowPath
              ? normalizedSelectedProjectId + "\u0000" + rowEnvironmentId + "\u0000" + rowPath
              : "";
            if (!suppressedFileKey) {
              setProjectOverviewFileActivityState?.((current) => ({
                ...current,
                items: (Array.isArray(current?.items) ? current.items : []).filter((item) => {
                  if (row?.record?.id && item?.id === row.record.id) {
                    return false;
                  }
                  const itemPath = normalizeHistoryPath(item?.path || item?.sourcePath || item?.workspacePath || "");
                  return !(rowPath && itemPath === rowPath);
                }),
              }));
              return;
            }
            const nextDeletedFileKeys = Array.from(new Set(
              (Array.isArray(selectedProjectOverviewDeletedFileKeys) ? selectedProjectOverviewDeletedFileKeys : [])
                .concat([suppressedFileKey])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            )).slice(-250);
            setProjectOverviewSuppressedFileKeys?.(nextDeletedFileKeys);
            setProjectOverviewFileActivityState?.((current) => ({
              ...current,
              items: (Array.isArray(current?.items) ? current.items : []).filter((item) => {
                const itemEnvironmentId = String(item?.environmentId || "").trim();
                const itemPath = normalizeHistoryPath(item?.path || item?.sourcePath || item?.workspacePath || "");
                return !(itemEnvironmentId === rowEnvironmentId && itemPath === rowPath);
              }),
            }));
            await persistProjectOverviewSidebarProjectUpdate({}, { projectOverviewDeletedFileKeys: nextDeletedFileKeys });
          }

          async function removeProjectOverviewRuntimeResource(row) {
            const resourceId = String(row?.record?.id || row?.id || "").trim();
            if (!resourceId) {
              return;
            }
            const headers = new Headers(requestHeaders || {});
            headers.set("Content-Type", "application/json");
            const response = await fetch(backendUrl + "/servers/" + encodeURIComponent(resourceId), {
              method: "PATCH",
              headers,
              body: JSON.stringify({ projectId: null }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to remove resource from project.");
            }
            setProjectOverviewServerResourcesState?.((current) => ({
              ...current,
              status: current?.status || "ready",
              error: "",
              items: (Array.isArray(current?.items) ? current.items : []).filter((item) => String(item?.id || "") !== resourceId),
            }));
          }

          async function handleRemoveProjectOverviewResourceFromProject(row) {
            const kind = String(row?.kind || "").trim();
            closeProjectOverviewResourceMenu();
            try {
              if (kind === "template") {
                await removeProjectOverviewTemplateResource(row);
              } else if (kind === "attachment") {
                await removeProjectOverviewAttachmentResource(row);
              } else if (kind === "file") {
                await removeProjectOverviewFileActivityResource(row);
              } else if (kind === "runtime") {
                await removeProjectOverviewRuntimeResource(row);
              }
            } catch (error) {
              if (typeof window !== "undefined") {
                window.alert(error instanceof Error ? error.message : "Failed to remove resource from project.");
              }
            }
          }

          function renderProjectOverviewResourceRowMenu(row) {
            const menuId = getProjectOverviewResourceRowMenuId(row);
            if (!menuId || projectOverviewResourceMenuId !== menuId) {
              return null;
            }
            return React.createElement("div", {
                className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-project-resources-action-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                onClick: (event) => event.stopPropagation(),
              },
              React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row playground-project-team-menu-item is-danger",
                  onClick: () => handleRemoveProjectOverviewResourceFromProject(row),
                },
                React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Remove from project")
              )
            );
          }

          function isProjectOverviewFileResourceRow(row) {
            return row?.kind === "attachment" || row?.kind === "file";
          }

          function buildProjectOverviewFileIconEntry(row) {
            const record = row?.record && typeof row.record === "object" ? row.record : {};
            const path = normalizeHistoryPath(
              row?.path
              || record.path
              || record.sourcePath
              || record.workspacePath
              || ""
            );
            const name = String(
              record.filename
              || record.name
              || record.title
              || row?.title
              || getHistoryPathName(path)
              || "Untitled file"
            ).trim();
            const rawMimeType = String(
              record.mimeType
              || record.contentType
              || record.fileType
              || (/[/]/.test(String(record.type || "")) ? record.type : "")
              || ""
            ).trim();
            return {
              name: name || getHistoryPathName(path) || "Untitled file",
              path,
              isFolder: Boolean(record.isFolder || record.type === "folder" || record.mimeType === "inode/directory"),
              mimeType: rawMimeType,
            };
          }

          function renderProjectOverviewResourceIcon(row, Icon) {
            if (isProjectOverviewFileResourceRow(row) && typeof PlaygroundFileIcon === "function") {
              const record = row?.record && typeof row.record === "object" ? row.record : {};
              const iconEntry = buildProjectOverviewFileIconEntry(row);
              const iconEnvironmentId = String(
                record.environmentId
                || row?.environmentId
                || activeProjectAttachmentEnvironmentId
                || selectedProject?.defaultEnvironmentId
                || ""
              ).trim();
              return React.createElement("span", { className: "playground-project-resource-title-icon is-file" },
                React.createElement(PlaygroundFileIcon, {
                  entry: iconEntry,
                  environmentId: iconEnvironmentId,
                  backendUrl,
                  useThumbnail: true,
                })
              );
            }
            const ResourceIcon = Icon || Layers;
            return React.createElement("span", { className: "playground-project-resource-title-icon" },
              React.createElement(ResourceIcon, { width: 16, height: 16, strokeWidth: 1.8 })
            );
          }

          function readProjectOverviewResourceCreatorString(record, keys = []) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : null;
            if (!source) return "";
            for (const key of keys) {
              const value = source[key];
              if (typeof value === "string" && value.trim()) return value.trim();
              if (typeof value === "number" && Number.isFinite(value)) return String(value);
            }
            return "";
          }

          function readProjectOverviewResourceCreatorObject(record, keys = []) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : null;
            if (!source) return null;
            for (const key of keys) {
              const value = source[key];
              if (value && typeof value === "object" && !Array.isArray(value)) return value;
            }
            return null;
          }

          function getProjectOverviewResourceAgentAvatarUrl(agent) {
            const rawAvatarUrl = String(
              (typeof getPlaygroundAgentProfilePhotoUrl === "function"
                ? getPlaygroundAgentProfilePhotoUrl(agent)
                : "")
              || agent?.profilePhotoUrl
              || agent?.avatarUrl
              || agent?.photoUrl
              || ""
            ).trim();
            return typeof normalizeSessionPhotoUrl === "function"
              ? normalizeSessionPhotoUrl(rawAvatarUrl)
              : rawAvatarUrl;
          }

          function findProjectOverviewResourceCreatorAgent(agentId, creatorName = "") {
            const agents = Array.isArray(sortedAgents) ? sortedAgents : [];
            const normalizedAgentId = String(agentId || "").trim().toLowerCase();
            const normalizedCreatorName = String(creatorName || "").trim().toLowerCase();
            if (normalizedAgentId) {
              const match = agents.find((agent) => {
                const candidateIds = [
                  agent?.id,
                  agent?.agentId,
                  agent?.agent_id,
                  agent?.slug,
                ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
                return candidateIds.includes(normalizedAgentId);
              });
              if (match) return match;
            }
            if (normalizedCreatorName) {
              return agents.find((agent) => String(agent?.name || agent?.displayName || "").trim().toLowerCase() === normalizedCreatorName) || null;
            }
            return null;
          }

          function isProjectOverviewCurrentUserCreator(creator) {
            const values = [
              creator?.id,
              creator?.userId,
              creator?.email,
              creator?.name,
            ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
            if (!values.length) return false;
            const currentValues = [
              currentUserEmail,
              currentUserName,
            ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
            return currentValues.some((value) => values.includes(value));
          }

          function getProjectOverviewResourceCreator(row) {
            const record = row?.record && typeof row.record === "object" && !Array.isArray(row.record) ? row.record : {};
            const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
            const definition = record.definition && typeof record.definition === "object" && !Array.isArray(record.definition) ? record.definition : {};
            const sources = [row, record, metadata, definition].filter((source) => source && typeof source === "object" && !Array.isArray(source));
            const creator = sources
              .map((source) => readProjectOverviewResourceCreatorObject(source, ["creator", "createdBy", "created_by", "author", "actor", "owner", "user"]))
              .find(Boolean) || {};
            const rawCreatedBy = sources
              .map((source) => readProjectOverviewResourceCreatorString(source, ["createdBy", "created_by", "author", "actor", "owner"]))
              .find(Boolean) || "";
            const rawType = readProjectOverviewResourceCreatorString(creator, ["type", "kind", "creatorType", "creator_type", "role"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorType", "creator_type", "createdByType", "created_by_type", "authorType", "actorType"])).find(Boolean)
              || "";
            const agentId = readProjectOverviewResourceCreatorString(creator, ["agentId", "agent_id"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorAgentId", "creator_agent_id", "createdByAgentId", "created_by_agent_id", "authorAgentId", "actorAgentId", "agentId", "agent_id"])).find(Boolean)
              || "";
            const userId = readProjectOverviewResourceCreatorString(creator, ["userId", "user_id"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorUserId", "creator_user_id", "createdByUserId", "created_by_user_id", "authorUserId", "actorUserId", "userId", "user_id"])).find(Boolean)
              || "";
            const id = readProjectOverviewResourceCreatorString(creator, ["id"])
              || agentId
              || userId
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorId", "creator_id", "createdById", "created_by_id", "authorId", "actorId"])).find(Boolean)
              || rawCreatedBy;
            const email = readProjectOverviewResourceCreatorString(creator, ["email"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorEmail", "creator_email", "createdByEmail", "created_by_email", "authorEmail", "actorEmail", "email"])).find(Boolean)
              || "";
            const rawName = readProjectOverviewResourceCreatorString(creator, ["name", "displayName", "display_name", "label", "email"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorName", "creator_name", "createdByName", "created_by_name", "createdByLabel", "created_by_label", "authorName", "actorName", "ownerName", "userName", "actor"])).find(Boolean)
              || (!agentId && !userId ? rawCreatedBy : "");
            const rawAvatarUrl = readProjectOverviewResourceCreatorString(creator, ["photoUrl", "photoURL", "avatarUrl", "avatarURL", "avatar", "picture"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorAvatarUrl", "creator_avatar_url", "creatorPhotoUrl", "creator_photo_url", "createdByAvatarUrl", "created_by_avatar_url", "authorAvatarUrl", "actorAvatarUrl", "ownerAvatarUrl", "avatarUrl", "photoUrl", "picture"])).find(Boolean)
              || "";
            const normalizedType = String(rawType || "").trim().toLowerCase();
            const type = normalizedType.includes("agent")
              ? "agent"
              : normalizedType.includes("user") || normalizedType.includes("human") || normalizedType.includes("person")
                ? "user"
                : agentId
                  ? "agent"
                  : userId || email
                    ? "user"
                    : "";
            const agent = type === "agent" || agentId
              ? findProjectOverviewResourceCreatorAgent(agentId || id, rawName)
              : null;
            if (agent) {
              return {
                type: "agent",
                id: String(agent?.id || agentId || id || "").trim(),
                agentId: String(agent?.id || agentId || "").trim(),
                userId: "",
                email: String(agent?.email || email || "").trim(),
                name: String(agent?.name || agent?.displayName || rawName || "Agent").trim(),
                avatarUrl: getProjectOverviewResourceAgentAvatarUrl(agent) || rawAvatarUrl,
              };
            }
            const normalizedCreator = {
              type: type || "user",
              id,
              agentId,
              userId,
              email,
              name: rawName || email || "Me",
              avatarUrl: rawAvatarUrl,
            };
            if (isProjectOverviewCurrentUserCreator(normalizedCreator) || (!rawName && !email && !userId && !agentId && !id)) {
              return {
                ...normalizedCreator,
                type: "user",
                name: "Me",
                avatarUrl: currentUserAvatarUrl || normalizedCreator.avatarUrl || "",
              };
            }
            return normalizedCreator;
          }

          function renderProjectOverviewResourceCreatorAvatar(creator) {
            const name = String(creator?.name || "Me").trim();
            const avatarUrl = String(creator?.avatarUrl || "").trim();
            if (avatarUrl && (typeof canRenderAvatarImage !== "function" || canRenderAvatarImage(avatarUrl))) {
              return React.createElement("img", {
                className: "playground-project-resources-creator-avatar playground-project-resources-creator-avatar-image",
                src: avatarUrl,
                alt: name || "Creator",
                draggable: false,
              });
            }
            return React.createElement("span", { className: "playground-project-resources-creator-avatar" },
              React.createElement("span", { className: "playground-project-resources-creator-avatar-fallback" },
                getProjectOverviewSidebarInitials(name || "Me")
              )
            );
          }

          function renderProjectOverviewResourceCreator(row) {
            const creator = getProjectOverviewResourceCreator(row);
            const name = String(creator?.name || "Me").trim() || "Me";
            return React.createElement("div", {
                className: "playground-project-resources-creator",
                title: creator?.email ? name + " · " + creator.email : name,
              },
              renderProjectOverviewResourceCreatorAvatar({ ...creator, name }),
              React.createElement("span", { className: "playground-project-resources-creator-name" }, name)
            );
          }

          function renderProjectOverviewResourceTableRows() {
            if (!projectOverviewAllResourceRows.length) {
              return renderProjectOverviewRecommendedTemplatesEmptyState();
            }
            if (!projectOverviewResourceRows.length) {
              return React.createElement("div", { className: "playground-project-resources-empty" }, "No resources match this view yet.");
            }
            if (projectOverviewResourceViewMode === "grid") {
              return React.createElement("div", { className: "playground-project-resources-grid" },
                projectOverviewResourceRows.map((row) => {
                  const meta = getProjectOverviewResourceTypeMeta(row.type);
                  const Icon = meta.Icon || Layers;
                  return React.createElement("button", {
                      key: row.key,
                      type: "button",
                      className: "playground-project-resources-grid-card",
                      onClick: () => openProjectOverviewResourceRow(row),
                    },
                    React.createElement("div", { className: "playground-project-resources-grid-card-top" },
                      renderProjectOverviewResourceIcon(row, Icon),
                      React.createElement("span", { className: "playground-project-resource-title-copy" },
                        React.createElement("span", { className: "playground-project-resource-title-main" }, row.title || "Untitled resource"),
                        row.subtitle
                          ? React.createElement("span", { className: "playground-project-resource-title-sub" }, row.subtitle)
                          : null
                      )
                    ),
                    React.createElement("div", { className: "playground-project-resources-grid-card-meta" },
                      React.createElement("span", { className: "playground-project-resources-cell" }, meta.label),
                      React.createElement("span", { className: "playground-project-resources-cell" }, row.updatedLabel || "-")
                    )
                  );
                })
              );
            }
            return React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-project-resources-row is-header" },
                React.createElement("div", null, "Resource"),
                React.createElement("div", null, "Creator"),
                React.createElement("div", null, "Updated"),
                React.createElement("div", null, "")
              ),
              projectOverviewResourceRows.map((row) => {
                const meta = getProjectOverviewResourceTypeMeta(row.type);
                const Icon = meta.Icon || Layers;
                const rowMenuId = getProjectOverviewResourceRowMenuId(row);
                const rowMenuOpen = projectOverviewResourceMenuId === rowMenuId;
                return React.createElement("div", {
                    key: row.key,
                    role: "button",
                    tabIndex: 0,
                    className: "playground-project-resources-row" + (rowMenuOpen ? " is-menu-open" : ""),
                    onClick: () => openProjectOverviewResourceRow(row),
                    onKeyDown: (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openProjectOverviewResourceRow(row);
                      }
                    },
                  },
                  React.createElement("div", { className: "playground-project-resource-title-cell" },
                    renderProjectOverviewResourceIcon(row, Icon),
                    React.createElement("span", { className: "playground-project-resource-title-copy" },
                      React.createElement("span", { className: "playground-project-resource-title-main" }, row.title || "Untitled resource")
                    )
                  ),
                  React.createElement("div", { className: "playground-project-resources-cell" }, renderProjectOverviewResourceCreator(row)),
                  React.createElement("div", { className: "playground-project-resources-cell" }, row.updatedLabel || "-"),
                  React.createElement("div", { className: "playground-project-resources-row-action" },
                    React.createElement("div", {
                        className: "playground-tasks-toolbar-popup-shell playground-project-resources-action-shell" + (rowMenuOpen ? " is-open" : ""),
                      },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-project-resources-action-button",
                        onClick: (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (typeof setProjectOverviewResourceToolbarPopover === "function") {
                            setProjectOverviewResourceToolbarPopover("");
                          }
                          setProjectOverviewResourceMenuId?.((current) => current === rowMenuId ? "" : rowMenuId);
                        },
                        "aria-label": "Resource actions for " + (row.title || "resource"),
                        "aria-expanded": rowMenuOpen ? "true" : "false",
                      }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                      renderProjectOverviewResourceRowMenu(row)
                    )
                  )
                );
              })
            );
          }

          function renderProjectOverviewResourcesHome() {
            return React.createElement(PlaygroundSharedResourcesTab, {
              rows: projectOverviewResourceRows,
              allRows: projectOverviewAllResourceRows,
              searchQuery: projectOverviewResourceSearchQuery,
              onSearchQueryChange: setProjectOverviewResourceSearchQuery,
              toolbarPopover: projectOverviewResourceToolbarPopover,
              onToolbarPopoverChange: setProjectOverviewResourceToolbarPopover,
              filter: projectOverviewResourceFilter,
              onFilterChange: setProjectOverviewResourceFilter,
              typeFilters: projectOverviewResourceTypeFilters,
              viewMode: projectOverviewResourceViewMode,
              onViewModeChange: setProjectOverviewResourceViewMode,
              menuId: projectOverviewResourceMenuId,
              onMenuIdChange: setProjectOverviewResourceMenuId,
              getTypeMeta: getProjectOverviewResourceTypeMeta,
              getRowMenuId: getProjectOverviewResourceRowMenuId,
              renderIcon: (row, meta) => renderProjectOverviewResourceIcon(row, meta?.Icon || Layers),
              renderCreator: renderProjectOverviewResourceCreator,
              renderRowMenu: renderProjectOverviewResourceRowMenu,
              renderNewMenu: renderProjectOverviewResourceNewMenu,
              renderEmptyContent: renderProjectOverviewRecommendedTemplatesEmptyState,
              onRowOpen: openProjectOverviewResourceRow,
              searchAriaLabel: "Search project resources",
              emptyLabel: "No resources yet.",
              noMatchesLabel: "No resources match this view yet.",
            });
          }

          function shouldShowProjectOverviewGeneralEmptyState() {
            const progressStats = getProjectOverviewProgressStats();
            const hasTasks = progressStats.scopeCount > 0
              || normalizedOverviewTasks.length > 0
              || Number(selectedProjectSummary?.tasksCount || 0) > 0
              || Number(selectedProjectSummary?.openTasksCount || 0) > 0;
            const hasThreads = projectThreads.length > 0
              || Number(selectedProjectSummary?.threadsCount || 0) > 0;
            const hasActivity = buildProjectOverviewActivityItems().length > 0;
            const hasMissionControlDocument = Boolean(
              String(missionControlDocumentDraft || selectedProjectMissionControl?.document || "").trim()
              || String(selectedProjectMissionControl?.summary || "").trim()
            );
            return !hasTasks
              && !hasThreads
              && !hasActivity
              && !projectHasCostData
              && !hasMissionControlDocument;
          }

          function renderProjectOverviewGeneralEmptyState() {
            const isMissionControlRunning = typeof isSelectedProjectMissionControlRunning !== "undefined"
              && Boolean(isSelectedProjectMissionControlRunning);
            const canOpenMissionControl = typeof openMissionControlComposer === "function";
            return React.createElement("section", { className: "playground-project-overview-general-empty-state" },
              React.createElement("div", {
                  className: "playground-settings-usage-chart-empty is-tall playground-auth-users-empty-state playground-configure-usage-empty-state playground-project-overview-general-empty-content",
                },
                React.createElement("img", {
                  className: "playground-auth-users-empty-state-image",
                  src: "/img/empty-state/no-agent-usage.avif",
                  alt: "",
                  "aria-hidden": "true",
                  draggable: "false",
                }),
                React.createElement("div", { className: "playground-auth-users-empty-state-title" }, "Kick off this project"),
                React.createElement("div", { className: "playground-auth-users-empty-state-copy" },
                  "Run Mission Control to generate the first strategy, backlog, and next steps for this project."
                ),
                React.createElement("div", { className: "playground-project-overview-general-empty-action" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-empty-primary-button playground-project-overview-general-empty-button",
                    disabled: !canOpenMissionControl || isMissionControlRunning,
                    onClick: () => {
                      if (canOpenMissionControl) {
                        openMissionControlComposer({ keepStrategyOpen: true });
                      }
                    },
                  },
                    isMissionControlRunning
                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 2, className: "playground-files-state-loader" })
                      : React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 2 }),
                    React.createElement("span", null, isMissionControlRunning ? "Running Mission Control" : "Run Mission Control")
                  )
                )
              )
            );
          }

          function renderProjectOverviewGeneralPanel() {
            if (shouldShowProjectOverviewGeneralEmptyState()) {
              return React.createElement("div", { className: "playground-project-overview-general-grid" },
                renderProjectOverviewGeneralEmptyState()
              );
            }
            return React.createElement("div", { className: "playground-project-overview-general-grid" },
              renderProjectOverviewProgressUsageChartSection(),
              renderProjectOverviewActivitySection(),
              renderProjectOverviewSetupSection(),
              renderProjectOverviewThreadsSection()
            );
          }

          function renderProjectOverviewResourcesPanel() {
            if (isProjectOverviewResourceSubviewOpen) {
              return React.createElement("div", { className: "playground-tasks-project-panel-grid" },
                renderProjectOverviewFilesTab(),
                renderProjectOverviewFileMenu()
              );
            }
            return renderProjectOverviewResourcesHome();
          }

          function getProjectOverviewSidebarInitials(value) {
            const words = String(value || "")
              .trim()
              .split(/\s+/)
              .filter(Boolean);
            if (!words.length) return "P";
            return words
              .slice(0, 2)
              .map((word) => word.charAt(0).toUpperCase())
              .join("");
          }

          function getProjectOverviewSidebarLead() {
            if (typeof getProjectListLead === "function") {
              const lead = getProjectListLead(selectedProject);
              return {
                id: String(lead?.id || lead?.userId || lead?.email || "").trim(),
                name: String(lead?.name || "Unassigned").trim() || "Unassigned",
                email: String(lead?.email || "").trim(),
                avatarUrl: String(lead?.avatarUrl || "").trim(),
              };
            }
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const metadataLead = metadata?.lead && typeof metadata.lead === "object" && !Array.isArray(metadata.lead)
              ? metadata.lead
              : {};
            const name = String(
              selectedProject?.leadName
                || metadata.leadName
                || metadataLead.name
                || metadataLead.displayName
                || "Unassigned"
            ).trim();
            const avatarUrl = String(
              selectedProject?.leadAvatarUrl
                || metadata.leadAvatarUrl
                || metadataLead.avatarUrl
                || metadataLead.photoUrl
                || ""
            ).trim();
            return {
              id: String(selectedProject?.leadUserId || metadata.leadUserId || metadataLead.userId || metadataLead.id || metadata.leadEmail || "").trim(),
              name: name || "Unassigned",
              email: String(selectedProject?.leadEmail || metadata.leadEmail || metadataLead.email || "").trim(),
              avatarUrl,
            };
          }

          function renderProjectOverviewSidebarAvatar(name, avatarUrl) {
            if (avatarUrl && (typeof canRenderAvatarImage !== "function" || canRenderAvatarImage(avatarUrl))) {
              return React.createElement("img", {
                className: "playground-project-overview-sidebar-avatar",
                src: avatarUrl,
                alt: name || "Project lead",
                draggable: false,
              });
            }
            return React.createElement("span", { className: "playground-project-overview-sidebar-avatar" },
              getProjectOverviewSidebarInitials(name || "Project lead")
            );
          }

          function getProjectOverviewSidebarStatusLabel() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const explicitStatus = String(selectedProject?.status || selectedProject?.state || metadata.status || "").trim();
            if (explicitStatus) {
              return explicitStatus.charAt(0).toUpperCase() + explicitStatus.slice(1).replace(/[_-]+/g, " ");
            }
            const progressStats = getProjectOverviewProgressStats();
            if (progressStats.scopeCount > 0 && progressStats.completedCount >= progressStats.scopeCount) {
              return "Completed";
            }
            if (progressStats.startedCount > 0) {
              return "In progress";
            }
            return "Backlog";
          }

          function getProjectOverviewSidebarPriorityLabel() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const priority = String(selectedProject?.priority || metadata.priority || "").trim();
            if (!priority) return "Medium";
            return priority.charAt(0).toUpperCase() + priority.slice(1).replace(/[_-]+/g, " ");
          }

          function getProjectOverviewSidebarDateLabel(value) {
            const raw = String(value || "").trim();
            if (!raw) return "";
            if (typeof formatPlaygroundFileDate === "function") {
              return formatPlaygroundFileDate(raw) || raw;
            }
            const timestamp = Date.parse(raw);
            if (!Number.isFinite(timestamp)) return raw;
            try {
              return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(timestamp));
            } catch {
              return raw;
            }
          }

          function getProjectOverviewSidebarMetadata(project = selectedProject) {
            return project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
              ? project.metadata
              : {};
          }

          function getProjectOverviewSidebarDateInputValue(value) {
            const raw = String(value || "").trim();
            if (!raw) return "";
            const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
            if (isoMatch) return isoMatch[0];
            const timestamp = Date.parse(raw);
            if (!Number.isFinite(timestamp)) return "";
            try {
              return new Date(timestamp).toISOString().slice(0, 10);
            } catch {
              return "";
            }
          }

          function getProjectOverviewSidebarStatusValue() {
            const metadata = getProjectOverviewSidebarMetadata(projectOverviewDraft);
            const raw = String(projectOverviewDraft?.status || projectOverviewDraft?.state || metadata.status || "backlog")
              .trim()
              .toLowerCase()
              .replace(/[\s-]+/g, "_");
            if (["done", "finished", "complete"].includes(raw)) return "completed";
            if (["doing", "active"].includes(raw)) return "in_progress";
            return ["backlog", "in_progress", "on_track", "at_risk", "blocked", "completed"].includes(raw) ? raw : "backlog";
          }

          function getProjectOverviewSidebarPriorityValue() {
            const metadata = getProjectOverviewSidebarMetadata(projectOverviewDraft);
            const raw = String(projectOverviewDraft?.priority || metadata.priority || "medium").trim().toLowerCase();
            return PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === raw) ? raw : "medium";
          }

          function getProjectOverviewSidebarProjectTypeValue() {
            const metadata = getProjectOverviewSidebarMetadata(projectOverviewDraft);
            return String(projectOverviewDraft?.projectType || projectOverviewDraft?.type || metadata.projectType || metadata.blueprintId || "blank").trim() || "blank";
          }

          function getProjectOverviewSidebarEnvironmentValue() {
            const metadata = getProjectOverviewSidebarMetadata(projectOverviewDraft);
            return String(projectOverviewDraft?.defaultEnvironmentId || metadata.defaultEnvironmentId || activeProjectAttachmentEnvironmentId || "").trim();
          }

          function commitProjectOverviewSidebarProjectRecord(projectRecord) {
            if (!projectRecord?.id || typeof commitLocalProjectRecord !== "function") {
              return;
            }
            const normalizedProjectRecord = normalizePlaygroundProjectRecord(projectRecord);
            if (typeof setProjectDraft === "function") {
              setProjectDraft((current) => {
                if (!current || String(current.id || "") !== String(normalizedProjectRecord.id || "")) {
                  return current;
                }
                return normalizePlaygroundProjectRecord({
                  ...current,
                  ...normalizedProjectRecord,
                  metadata: {
                    ...(current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata) ? current.metadata : {}),
                    ...(normalizedProjectRecord.metadata && typeof normalizedProjectRecord.metadata === "object" && !Array.isArray(normalizedProjectRecord.metadata) ? normalizedProjectRecord.metadata : {}),
                  },
                });
              });
            }
            commitLocalProjectRecord(normalizedProjectRecord, {
              summary: normalizedProjectRecord.summary || selectedProjectSummary,
              environments: selectedProjectEnvironments,
              recentThreads: selectedProjectRecentThreads,
              threads: selectedProjectRecentThreads,
              selectImmediately: true,
            });
          }

          async function persistProjectOverviewSidebarProjectUpdate(projectUpdates = {}, metadataUpdates = {}) {
            const baseProject = normalizePlaygroundProjectRecord(projectOverviewDraft || selectedProject);
            const normalizedProjectId = String(baseProject.id || normalizedSelectedProjectId || "").trim();
            if (!normalizedProjectId) {
              return null;
            }
            const baseMetadata = getProjectOverviewSidebarMetadata(baseProject);
            const nextMetadata = {
              ...baseMetadata,
              ...(metadataUpdates && typeof metadataUpdates === "object" ? metadataUpdates : {}),
            };
            const nextProjectRecord = normalizePlaygroundProjectRecord({
              ...baseProject,
              ...(projectUpdates && typeof projectUpdates === "object" ? projectUpdates : {}),
              metadata: nextMetadata,
              updatedAt: new Date().toISOString(),
            });
            commitProjectOverviewSidebarProjectRecord(nextProjectRecord);
            if (typeof setProjectSaveState === "function") {
              setProjectSaveState({ isSaving: true, error: "", message: "" });
            }
            try {
              const payload = buildPlaygroundProjectSavePayload(nextProjectRecord, metadataUpdates);
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
                method: "PATCH",
                headers,
                body: JSON.stringify(payload),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to update project.");
              }
              const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
              if (updatedProject?.id) {
                commitProjectOverviewSidebarProjectRecord(updatedProject);
              }
              if (typeof setProjectSaveState === "function") {
                setProjectSaveState({ isSaving: false, error: "", message: "Saved" });
              }
              return updatedProject || nextProjectRecord;
            } catch (error) {
              commitProjectOverviewSidebarProjectRecord(baseProject);
              if (typeof setProjectSaveState === "function") {
                setProjectSaveState({
                  isSaving: false,
                  error: error instanceof Error ? error.message : "Failed to update project.",
                  message: "",
                });
              }
              return null;
            }
          }

          function updateProjectOverviewSidebarProjectProperty(projectUpdates = {}, metadataUpdates = {}) {
            if (typeof setProjectOverviewSidebarPropertyPopover === "function") {
              setProjectOverviewSidebarPropertyPopover("");
            }
            void persistProjectOverviewSidebarProjectUpdate(projectUpdates, metadataUpdates);
          }

          function getProjectOverviewWallpaperOptions() {
            return typeof PLAYGROUND_PROJECT_WALLPAPER_OPTIONS !== "undefined" && Array.isArray(PLAYGROUND_PROJECT_WALLPAPER_OPTIONS)
              ? PLAYGROUND_PROJECT_WALLPAPER_OPTIONS
              : [];
          }

          function getProjectOverviewWallpaperId(projectRecord = projectOverviewDraft) {
            const wallpaperOptions = getProjectOverviewWallpaperOptions();
            const fallbackId = wallpaperOptions[0]?.id || "";
            const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
              ? projectRecord.metadata
              : {};
            if (typeof getPlaygroundProjectWallpaperId === "function") {
              return getPlaygroundProjectWallpaperId(projectRecord?.wallpaperId || metadata.wallpaperId, fallbackId);
            }
            return String(projectRecord?.wallpaperId || metadata.wallpaperId || fallbackId || "").trim();
          }

          function getProjectOverviewWallpaperConfig(wallpaperId, projectRecord = projectOverviewDraft) {
            const wallpaperOptions = getProjectOverviewWallpaperOptions();
            const fallback = wallpaperOptions[0] || { id: "", name: "Background", url: "" };
            if (typeof getPlaygroundProjectWallpaperConfig === "function") {
              return getPlaygroundProjectWallpaperConfig(wallpaperId || projectRecord, 0) || fallback;
            }
            const normalizedWallpaperId = String(wallpaperId || "").trim();
            return wallpaperOptions.find((option) => option.id === normalizedWallpaperId) || fallback;
          }

          function buildProjectOverviewWallpaperBackgroundImage(wallpaperId, projectRecord = projectOverviewDraft) {
            if (typeof buildProjectWallpaperBackgroundImage === "function") {
              return buildProjectWallpaperBackgroundImage(wallpaperId, projectRecord);
            }
            const wallpaper = getProjectOverviewWallpaperConfig(wallpaperId, projectRecord);
            return wallpaper?.url ? "url(" + wallpaper.url + ")" : "";
          }

          function commitProjectOverviewWallpaperDraft(wallpaperId, useCardBackgroundAsWallpaper = true) {
            const normalizedWallpaperId = getProjectOverviewWallpaperId({
              wallpaperId,
              metadata: { wallpaperId },
            });
            if (!normalizedWallpaperId || typeof setProjectDraft !== "function") {
              return;
            }
            setProjectDraft((current) => {
              if (!current || String(current.id || "") !== normalizedSelectedProjectId) {
                return current;
              }
              const currentMetadata = current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                ? current.metadata
                : {};
              return normalizePlaygroundProjectRecord({
                ...current,
                wallpaperId: normalizedWallpaperId,
                useCardBackgroundAsWallpaper,
                metadata: {
                  ...currentMetadata,
                  wallpaperId: normalizedWallpaperId,
                  useCardBackgroundAsWallpaper,
                },
              });
            });
          }

          async function handleProjectOverviewWallpaperStep(direction) {
            const wallpaperOptions = getProjectOverviewWallpaperOptions();
            if (!wallpaperOptions.length || projectSaveState?.isSaving) {
              return;
            }
            const step = direction === "prev" ? -1 : 1;
            const baseProject = normalizePlaygroundProjectRecord(projectOverviewDraft || selectedProject);
            const currentWallpaperId = getProjectOverviewWallpaperId(baseProject);
            const currentIndex = wallpaperOptions.findIndex((wallpaper) => wallpaper.id === currentWallpaperId);
            const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
            const nextIndex = (safeCurrentIndex + step + wallpaperOptions.length) % wallpaperOptions.length;
            const nextWallpaper = wallpaperOptions[nextIndex] || wallpaperOptions[0];
            if (!nextWallpaper?.id || nextWallpaper.id === currentWallpaperId) {
              return;
            }

            if (projectWallpaperTransitionTimerRef?.current) {
              window.clearTimeout(projectWallpaperTransitionTimerRef.current);
              projectWallpaperTransitionTimerRef.current = null;
            }

            if (typeof setProjectWallpaperTransition === "function") {
              setProjectWallpaperTransition({
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                direction: step > 0 ? "next" : "prev",
                from: buildProjectOverviewWallpaperBackgroundImage(currentWallpaperId, baseProject),
                to: buildProjectOverviewWallpaperBackgroundImage(nextWallpaper.id, baseProject),
                fromPreview: "url(" + (wallpaperOptions[safeCurrentIndex]?.url || wallpaperOptions[0]?.url || "") + ")",
                toPreview: "url(" + nextWallpaper.url + ")",
              });
              if (projectWallpaperTransitionTimerRef) {
                projectWallpaperTransitionTimerRef.current = window.setTimeout(() => {
                  setProjectWallpaperTransition(null);
                  projectWallpaperTransitionTimerRef.current = null;
                }, 380);
              }
            }

            if (projectDraftWallpaperIdRef) {
              projectDraftWallpaperIdRef.current = nextWallpaper.id;
            }
            if (projectDraftUseCardBackgroundAsWallpaperRef) {
              projectDraftUseCardBackgroundAsWallpaperRef.current = true;
            }
            commitProjectOverviewWallpaperDraft(nextWallpaper.id, true);

            const updatedProject = await persistProjectOverviewSidebarProjectUpdate({
              wallpaperId: nextWallpaper.id,
              useCardBackgroundAsWallpaper: true,
            }, {
              wallpaperId: nextWallpaper.id,
              useCardBackgroundAsWallpaper: true,
            });
            if (!updatedProject) {
              commitProjectOverviewWallpaperDraft(currentWallpaperId, baseProject.useCardBackgroundAsWallpaper !== false);
            }
          }

          function renderProjectOverviewWallpaperSettingsSection() {
            const wallpaperOptions = getProjectOverviewWallpaperOptions();
            if (!wallpaperOptions.length) {
              return null;
            }
            const currentWallpaperId = getProjectOverviewWallpaperId(projectOverviewDraft);
            const currentWallpaper = getProjectOverviewWallpaperConfig(currentWallpaperId, projectOverviewDraft);
            const previewBackgroundImage = currentWallpaper?.url ? "url(" + currentWallpaper.url + ")" : undefined;
            const isPreviewTransitioning = projectWallpaperTransition
              && typeof projectWallpaperTransition.fromPreview === "string"
              && typeof projectWallpaperTransition.toPreview === "string";
            return React.createElement("section", { className: "playground-project-settings-section playground-project-settings-wallpaper-section" },
              React.createElement("div", { className: "playground-project-overview-strategy-add-row playground-project-overview-rules-inline-title-row" },
                React.createElement("h2", { className: "playground-project-overview-strategy-add-title" }, "Background")
              ),
              React.createElement("div", { className: "playground-tasks-project-wallpaper-picker" },
                React.createElement("div", {
                    className: "playground-tasks-project-wallpaper-picker-preview" + (isPreviewTransitioning ? " is-" + projectWallpaperTransition.direction : ""),
                    style: isPreviewTransitioning ? undefined : { backgroundImage: previewBackgroundImage },
                    "aria-hidden": "true",
                  },
                  isPreviewTransitioning
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", {
                          className: "playground-tasks-project-wallpaper-picker-preview-image is-outgoing",
                          style: { backgroundImage: projectWallpaperTransition.fromPreview },
                        }),
                        React.createElement("div", {
                          className: "playground-tasks-project-wallpaper-picker-preview-image is-incoming",
                          style: { backgroundImage: projectWallpaperTransition.toPreview },
                        })
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-wallpaper-picker-controls" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-project-wallpaper-picker-button",
                    onClick: () => void handleProjectOverviewWallpaperStep("prev"),
                    disabled: projectSaveState?.isSaving,
                    "aria-label": "Previous background image",
                    title: "Previous background image",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                  React.createElement("div", { className: "playground-tasks-project-wallpaper-picker-label" },
                    currentWallpaper?.name || "Background"
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-project-wallpaper-picker-button",
                    onClick: () => void handleProjectOverviewWallpaperStep("next"),
                    disabled: projectSaveState?.isSaving,
                    "aria-label": "Next background image",
                    title: "Next background image",
                  }, React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.8 }))
                )
              )
            );
          }

          function renderProjectOverviewSidebarSelectOption(option) {
            const optionId = String(option?.id || option?.key || option?.label || "").trim();
            const label = String(option?.label || option?.name || optionId || "Option").trim();
            const description = String(option?.description || option?.email || "").trim();
            return React.createElement("button", {
                key: optionId || label,
                type: "button",
                className: "playground-project-overview-sidebar-select-option" + (option?.selected ? " is-selected" : ""),
                onClick: option?.onSelect,
              },
              React.createElement("span", { className: "playground-project-overview-sidebar-select-option-main" },
                option?.icon || null,
                React.createElement("span", { className: "playground-project-overview-sidebar-select-option-copy" },
                  React.createElement("span", { className: "playground-project-overview-sidebar-select-option-label" }, label),
                  description
                    ? React.createElement("span", { className: "playground-project-overview-sidebar-select-option-description" }, description)
                    : null
                )
              ),
              option?.selected
                ? React.createElement(Check, { className: "playground-project-overview-sidebar-select-option-check", strokeWidth: 2 })
                : React.createElement("span", null)
            );
          }

          function renderProjectOverviewSidebarSelectControl(id, content, options = {}) {
            const normalizedId = String(id || "").trim();
            const isOpen = Boolean(normalizedId && projectOverviewSidebarPropertyPopover === normalizedId);
            return renderPlaygroundPlatformPopup({
              open: isOpen,
              shellClassName: "playground-project-overview-sidebar-select-shell",
              menuClassName: "playground-project-overview-sidebar-select-menu",
              menuProps: {
                onClick: (event) => event.stopPropagation(),
              },
              trigger: React.createElement("button", {
                type: "button",
                className: "playground-project-overview-sidebar-select-trigger" + (isOpen ? " is-open" : "") + (options.empty ? " is-empty" : ""),
                onClick: (event) => {
                  event.stopPropagation();
                  if (normalizedId === "lead" && !isOpen && projectOverviewSharedTeamId) {
                    requestProjectOverviewWorkspaceTeams({ teamId: projectOverviewSharedTeamId });
                  }
                  if (typeof setProjectOverviewSidebarPropertyPopover === "function") {
                    setProjectOverviewSidebarPropertyPopover(isOpen ? "" : normalizedId);
                  }
                },
                "aria-expanded": isOpen ? "true" : "false",
              },
                React.createElement("span", { className: "playground-project-overview-sidebar-select-trigger-copy" }, content),
                React.createElement(ChevronDown, { className: "playground-project-overview-sidebar-select-trigger-caret", strokeWidth: 2 })
              ),
              children: options.children,
            });
          }

          function getProjectOverviewLeadCandidateSources(record) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
            const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
            return [
              source,
              source.user,
              source.profile,
              source.account,
              source.member,
              source.identity,
              source.userProfile,
              source.accountProfile,
              source.publicProfile,
              metadata,
              metadata.user,
              metadata.profile,
              metadata.account,
              metadata.member,
              metadata.identity,
              metadata.userProfile,
              metadata.accountProfile,
              metadata.publicProfile,
            ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
          }

          function readProjectOverviewLeadCandidateString(record, keys = []) {
            for (const source of getProjectOverviewLeadCandidateSources(record)) {
              for (const key of keys) {
                const value = String(source?.[key] || "").replace(/\s+/g, " ").trim();
                if (value) {
                  return value;
                }
              }
            }
            return "";
          }

          function getProjectOverviewLeadCandidateName(record) {
            const directName = readProjectOverviewLeadCandidateString(record, [
              "displayName",
              "display_name",
              "name",
              "fullName",
              "full_name",
              "accountDisplayName",
              "accountName",
              "memberDisplayName",
              "memberName",
              "publicName",
              "username",
              "userName",
              "label",
            ]);
            if (directName) {
              return directName;
            }
            for (const source of getProjectOverviewLeadCandidateSources(record)) {
              const firstName = String(source.firstName || source.first_name || source.givenName || source.given_name || "").trim();
              const lastName = String(source.lastName || source.last_name || source.familyName || source.family_name || "").trim();
              const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
              if (fullName) {
                return fullName;
              }
            }
            return "";
          }

          function getProjectOverviewLeadCandidateEmail(record) {
            return readProjectOverviewLeadCandidateString(record, [
              "email",
              "emailAddress",
              "email_address",
              "mail",
              "primaryEmail",
              "primary_email",
            ]).toLowerCase();
          }

          function getProjectOverviewLeadCandidateUserId(record) {
            return readProjectOverviewLeadCandidateString(record, [
              "userId",
              "user_id",
              "uid",
              "accountId",
              "account_id",
              "memberUserId",
              "member_user_id",
              "localId",
              "local_id",
            ]);
          }

          function getProjectOverviewLeadCandidateAvatarUrl(record) {
            return readProjectOverviewLeadCandidateString(record, [
              "photoURL",
              "photoUrl",
              "photo_url",
              "avatarUrl",
              "avatarURL",
              "avatar",
              "picture",
              "imageUrl",
              "profileImageUrl",
              "profile_image_url",
            ]);
          }

          function isProjectOverviewAgentLeadCandidate(record) {
            const sources = getProjectOverviewLeadCandidateSources(record);
            const typeValues = [];
            sources.forEach((source) => {
              [
                source.type,
                source.kind,
                source.memberType,
                source.member_type,
                source.actorKind,
                source.actor_kind,
                source.agentType,
                source.agent_type,
                source.resourceType,
                source.resource_type,
                source.subjectType,
                source.subject_type,
                source.entityType,
                source.entity_type,
              ].forEach((value) => {
                const normalized = String(value || "").trim().toLowerCase();
                if (normalized) {
                  typeValues.push(normalized);
                }
              });
            });
            if (typeValues.some((value) => value.includes("agent") || value.includes("bot") || value.includes("assistant") || value.includes("automation"))) {
              return true;
            }
            return sources.some((source) =>
              source.isAgent === true
              || source.agent === true
              || Boolean(String(source.agentId || source.agent_id || source.agentUid || source.agent_uid || "").trim())
            );
          }

          function isProjectOverviewHumanLeadCandidate(record, options = {}) {
            if (options.forceHuman) {
              return true;
            }
            if (isProjectOverviewAgentLeadCandidate(record)) {
              return false;
            }
            if (getProjectOverviewLeadCandidateEmail(record) || getProjectOverviewLeadCandidateUserId(record)) {
              return true;
            }
            return getProjectOverviewLeadCandidateSources(record).some((source) => {
              const normalized = String(source.type || source.kind || source.memberType || source.member_type || source.subjectType || source.subject_type || "").trim().toLowerCase();
              return normalized.includes("human")
                || normalized.includes("user")
                || normalized.includes("person")
                || normalized.includes("account")
                || normalized === "member";
            });
          }

          function collectProjectOverviewLeadCandidateRecords(value, addCandidate) {
            if (Array.isArray(value)) {
              value.forEach((item) => collectProjectOverviewLeadCandidateRecords(item, addCandidate));
              return;
            }
            if (!value || typeof value !== "object") {
              return;
            }
            addCandidate(value);
            const source = value;
            const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
            [
              source.members,
              source.teamMembers,
              source.users,
              source.userMembers,
              source.memberProfiles,
              source.memberships,
              source.collaborators,
              source.sharedWith,
              source.sharedWithUsers,
              source.accessUsers,
              metadata.members,
              metadata.teamMembers,
              metadata.users,
              metadata.userMembers,
              metadata.memberProfiles,
              metadata.memberships,
              metadata.collaborators,
              metadata.sharedWith,
              metadata.sharedWithUsers,
              metadata.accessUsers,
            ].forEach((collection) => {
              if (Array.isArray(collection)) {
                collection.forEach((item) => addCandidate(item));
              }
            });
          }

          function buildProjectOverviewSidebarLeadOptions() {
            const currentLead = getProjectOverviewSidebarLead();
            const options = [];
            const seen = new Set();
            function addOption(option, addOptions = {}) {
              if (!option || typeof option !== "object") {
                return;
              }
              if (option.id !== "__unassigned__" && !isProjectOverviewHumanLeadCandidate(option, addOptions)) {
                return;
              }
              const name = getProjectOverviewLeadCandidateName(option) || String(option?.name || option?.label || "").trim();
              const email = getProjectOverviewLeadCandidateEmail(option) || String(option?.email || "").trim();
              const userId = getProjectOverviewLeadCandidateUserId(option) || String(option?.userId || "").trim();
              const id = String(userId || email || option?.id || name || "").trim();
              if (!id && !name) return;
              const key = (id || email || name).toLowerCase();
              if (seen.has(key)) return;
              seen.add(key);
              options.push({
                id: id || key,
                name: name || email || "Project lead",
                email,
                avatarUrl: getProjectOverviewLeadCandidateAvatarUrl(option) || String(option?.avatarUrl || option?.photoUrl || option?.profilePhotoUrl || "").trim(),
              });
            }
            addOption({
              id: "__unassigned__",
              name: "Unassigned",
            }, { forceHuman: true });
            addOption({
              id: currentLead.id || currentLead.email || currentLead.name,
              userId: currentLead.id,
              name: currentLead.name,
              email: currentLead.email,
              avatarUrl: currentLead.avatarUrl,
            });
            [
              projectOverviewSharedWorkspaceTeam,
              ...projectOverviewSharedTeamMemberRows,
              ...(Array.isArray(workspaceTeams) ? workspaceTeams : []),
            ].forEach((source) => collectProjectOverviewLeadCandidateRecords(source, addOption));
            return options;
          }

          function renderProjectOverviewSidebarRow(label, value, options = {}) {
            const content = options.content || React.createElement("span", null, value || "None");
            return React.createElement("div", { className: "playground-project-overview-sidebar-row" },
              React.createElement("div", { className: "playground-project-overview-sidebar-row-label" }, label),
              React.createElement("div", {
                className: "playground-project-overview-sidebar-row-value"
                  + (!value && !options.content ? " playground-project-overview-sidebar-muted" : "")
                  + (options.editable ? " is-editable" : ""),
              }, content)
            );
          }

          function renderProjectOverviewSidebarActivity() {
            const activityItems = buildProjectOverviewActivityItems().slice(0, 4);
            if (!activityItems.length) {
              return React.createElement("div", { className: "playground-project-overview-sidebar-empty" }, "No recent activity yet.");
            }
            return React.createElement("div", { className: "playground-project-overview-sidebar-activity-list" },
              activityItems.map((item) =>
                React.createElement("div", { key: item.id, className: "playground-project-overview-sidebar-activity-row" },
                  renderProjectOverviewActivityAvatar(item),
                  React.createElement("div", { className: "playground-project-overview-sidebar-activity-copy" },
                    React.createElement("strong", null, item.actor),
                    React.createElement("span", null, " " + item.verb + " "),
                    item.taskId && typeof handleSelectTask === "function"
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-project-overview-sidebar-activity-object",
                          onClick: (event) => {
                            event.stopPropagation();
                            handleSelectTask(item.taskId);
                          },
                        }, item.object)
                      : React.createElement("strong", null, item.object),
                    item.timeLabel
                      ? React.createElement("span", null, " · " + item.timeLabel)
                      : null
                  )
                )
              )
            );
          }

          function openProjectOverviewSidebarResourceTarget(resourceType) {
            const id = String(resourceType || "").trim();
            if (id === "files") {
              if (typeof onOpenFilesPage === "function") {
                onOpenFilesPage({
                  token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                  projectId: normalizedSelectedProjectId,
                  environmentId: activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                });
              }
              return;
            }
            if (id === "metronomes") {
              if (typeof onOpenProjectMetronomes === "function") {
                onOpenProjectMetronomes({ projectId: normalizedSelectedProjectId });
              }
              return;
            }
            if (typeof setProjectOverviewHomeTab === "function") {
              setProjectOverviewHomeTab("resources");
            }
            if (typeof setProjectOverviewFilesSubview === "function") {
              const resourceSubviewId = ["web-apps", "functions", "databases", "imagine"].includes(id) ? id : "resources";
              setProjectOverviewFilesSubview(resourceSubviewId);
            }
          }

          function renderProjectOverviewSidebarResourceRow(resource) {
            const Icon = resource.Icon || Server;
            const count = Math.max(0, Number(resource.count || 0));
            return React.createElement("button", {
                key: resource.id,
                type: "button",
                className: "playground-project-overview-sidebar-resource-row",
                onClick: () => openProjectOverviewSidebarResourceTarget(resource.id),
              },
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.85 })
              ),
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, resource.label),
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-count" },
                typeof formatProjectOverviewInteger === "function" ? formatProjectOverviewInteger(count) : String(count)
              )
            );
          }

          function renderProjectOverviewSidebar() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const lead = getProjectOverviewSidebarLead();
            const progressStats = getProjectOverviewProgressStats();
            const operatingProfile = getProjectOverviewOperatingProfile();
            const projectTypeLabel = String(operatingProfile?.label || operatingProfile?.name || metadata.projectTypeLabel || "").trim();
            const targetDateLabel = getProjectOverviewSidebarDateLabel(selectedProject?.targetDate || selectedProject?.dueDate || metadata.targetDate || metadata.dueDate);
            const startDateLabel = getProjectOverviewSidebarDateLabel(selectedProject?.startDate || metadata.startDate || selectedProject?.createdAt);
            const defaultComputerLabel = String(
              activeProjectAttachmentEnvironment?.name
                || selectedProject?.defaultEnvironmentName
                || metadata.defaultEnvironmentName
                || "Default"
            ).trim();
            const issueCount = Math.max(
              0,
              Number(selectedProjectSummary?.openTasksCount) || Number(selectedProjectTaskStatusOverview?.total) || Number(progressStats.scopeCount) || 0
            );
            const releaseSections = overviewCurrentTaskReleaseSections
              .filter((section) => section.key !== "__no_release__");
            const metronomeResourceCount = allOverviewResourceItems.filter((item) => isProjectOverviewMetronomeResource(item)).length;
            const webAppResourceCount = allOverviewResourceItems
              .filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewWebAppResource(item))
              .length;
            const functionResourceCount = allOverviewResourceItems
              .filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewFunctionResource(item))
              .length;
            const databaseResourceCount = allOverviewResourceItems
              .filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewDatabaseResource(item))
              .length;
            const sidebarResources = [
              { id: "files", label: "Files", count: allOverviewProjectFileCount, Icon: FolderOpen },
              { id: "metronomes", label: "Metronomes", count: metronomeResourceCount, Icon: Metronome },
              { id: "web-apps", label: "Web Apps", count: webAppResourceCount, Icon: Monitor },
              { id: "functions", label: "Functions", count: functionResourceCount, Icon: FunctionSquare },
              { id: "databases", label: "Databases", count: databaseResourceCount, Icon: Database },
              { id: "imagine", label: "Imagine Resources", count: projectOverviewImagineResources.length, Icon: Clapperboard },
            ];
            const statusOptions = [
              { id: "backlog", label: "Backlog" },
              { id: "in_progress", label: "In progress" },
              { id: "on_track", label: "On track" },
              { id: "at_risk", label: "At risk" },
              { id: "blocked", label: "Blocked" },
              { id: "completed", label: "Completed" },
            ];
            const currentStatusValue = getProjectOverviewSidebarStatusValue();
            const currentStatusOption = statusOptions.find((option) => option.id === currentStatusValue) || statusOptions[0];
            const currentPriorityValue = getProjectOverviewSidebarPriorityValue();
            const currentProjectTypeValue = getProjectOverviewSidebarProjectTypeValue();
            const currentProjectType = typeof getPlaygroundProjectBlueprint === "function"
              ? getPlaygroundProjectBlueprint(currentProjectTypeValue)
              : null;
            const currentProjectTypeLabel = String(currentProjectType?.title || projectTypeLabel || "Blank Project").trim();
            const currentEnvironmentValue = getProjectOverviewSidebarEnvironmentValue();
            const currentEnvironment = projectComposerAvailableEnvironments.find((environment) => String(environment?.id || "") === currentEnvironmentValue)
              || activeProjectAttachmentEnvironment
              || projectComposerAvailableEnvironments[0]
              || null;
            const currentEnvironmentLabel = String(
              currentEnvironment?.name
                || defaultComputerLabel
                || "Default"
            ).trim();
            const startDateInputValue = getProjectOverviewSidebarDateInputValue(selectedProject?.startDate || metadata.startDate);
            const targetDateInputValue = getProjectOverviewSidebarDateInputValue(selectedProject?.targetDate || selectedProject?.dueDate || metadata.targetDate || metadata.dueDate);
            const leadOptions = buildProjectOverviewSidebarLeadOptions();
            const selectedLeadKey = String(lead.id || lead.email || lead.name || "").trim().toLowerCase();
            const renderStatusContent = (option) => React.createElement(React.Fragment, null,
              React.createElement("span", { className: "playground-project-overview-sidebar-status-dot" }),
              React.createElement("span", null, option?.label || "Backlog")
            );
            const renderProjectTypeIcon = (blueprint) => {
              const Icon = blueprint?.Icon || Rocket;
              return React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.85 })
              );
            };

            return React.createElement("aside", { className: "playground-project-overview-sidebar", "aria-label": "Project settings" },
              React.createElement("section", { className: "playground-project-overview-sidebar-card" },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Properties")
                ),
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  renderProjectOverviewSidebarRow("Priority", getPlaygroundTaskPriorityLabel(currentPriorityValue), {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("priority", renderPlaygroundTaskPriorityLabel(currentPriorityValue), {
                      children: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) => renderProjectOverviewSidebarSelectOption({
                        id: option.id,
                        label: option.label,
                        selected: option.id === currentPriorityValue,
                        icon: renderPlaygroundTaskPriorityIcon(option.id),
                        onSelect: () => updateProjectOverviewSidebarProjectProperty({
                          priority: option.id,
                        }, {
                          priority: option.id,
                        }),
                      })),
                    }),
                  }),
                  renderProjectOverviewSidebarRow("Lead", lead.name, {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("lead", React.createElement("span", { className: "playground-project-overview-sidebar-lead" },
                      renderProjectOverviewSidebarAvatar(lead.name, lead.avatarUrl),
                      React.createElement("span", null, lead.name)
                    ), {
                      empty: !lead.name || lead.name === "Unassigned",
                      children: leadOptions.map((option) => {
                        const optionKey = String(option.id || option.email || option.name || "").trim().toLowerCase();
                        const isUnassigned = option.id === "__unassigned__";
                        const isSelected = Boolean(optionKey && selectedLeadKey && (optionKey === selectedLeadKey || (isUnassigned && selectedLeadKey === "unassigned")));
                        return renderProjectOverviewSidebarSelectOption({
                          id: option.id,
                          label: option.name,
                          description: option.email,
                          selected: isSelected || (!selectedLeadKey && isUnassigned),
                          icon: renderProjectOverviewSidebarAvatar(option.name, option.avatarUrl),
                          onSelect: () => {
                            const leadRecord = isUnassigned
                              ? null
                              : {
                                  id: option.id,
                                  userId: option.id,
                                  name: option.name,
                                  email: option.email,
                                  avatarUrl: option.avatarUrl,
                                };
                            updateProjectOverviewSidebarProjectProperty({
                              leadUserId: isUnassigned ? "" : option.id,
                              leadName: isUnassigned ? "" : option.name,
                              leadEmail: isUnassigned ? "" : option.email,
                              leadAvatarUrl: isUnassigned ? "" : option.avatarUrl,
                            }, {
                              leadUserId: isUnassigned ? "" : option.id,
                              leadName: isUnassigned ? "" : option.name,
                              leadEmail: isUnassigned ? "" : option.email,
                              leadAvatarUrl: isUnassigned ? "" : option.avatarUrl,
                              lead: leadRecord,
                            });
                          },
                        });
                      }),
                    }),
                  }),
                  renderProjectOverviewSidebarRow("Type", currentProjectTypeLabel, {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("type", React.createElement(React.Fragment, null,
                      renderProjectTypeIcon(currentProjectType),
                      React.createElement("span", null, currentProjectTypeLabel)
                    ), {
                      children: PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS.map((blueprint) => renderProjectOverviewSidebarSelectOption({
                        id: blueprint.id,
                        label: blueprint.title,
                        description: blueprint.description,
                        selected: blueprint.id === getPlaygroundProjectBlueprintId(currentProjectTypeValue),
                        icon: renderProjectTypeIcon(blueprint),
                        onSelect: () => {
                          const blueprintMetadata = typeof buildPlaygroundProjectBlueprintMetadata === "function"
                            ? buildPlaygroundProjectBlueprintMetadata(blueprint)
                            : { projectType: blueprint.id, blueprintId: blueprint.id };
                          updateProjectOverviewSidebarProjectProperty({
                            projectType: blueprint.id,
                            type: blueprint.id,
                          }, {
                            ...blueprintMetadata,
                            projectType: blueprint.id,
                            blueprintId: blueprint.id,
                          });
                        },
                      })),
                    }),
                  }),
                  renderProjectOverviewSidebarRow("Computer", currentEnvironmentLabel, {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("computer", React.createElement(React.Fragment, null,
                      React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.85 }),
                      React.createElement("span", null, currentEnvironmentLabel)
                    ), {
                      children: projectComposerAvailableEnvironments.length > 0
                        ? projectComposerAvailableEnvironments.map((environment) => {
                            const environmentId = String(environment?.id || "").trim();
                            const environmentName = String(environment?.name || environment?.label || "Computer").trim();
                            return renderProjectOverviewSidebarSelectOption({
                              id: environmentId,
                              label: environmentName,
                              description: environment?.isDefault ? "Default computer" : "",
                              selected: environmentId && environmentId === currentEnvironmentValue,
                              icon: React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.85 }),
                              onSelect: () => updateProjectOverviewSidebarProjectProperty({
                                defaultEnvironmentId: environmentId,
                                defaultEnvironmentName: environmentName,
                              }, {
                                defaultEnvironmentId: environmentId || null,
                                defaultEnvironmentName: environmentName,
                              }),
                            });
                          })
                        : React.createElement("div", { className: "playground-project-overview-sidebar-empty" }, "No computers available.")
                    }),
                  }),
                )
              ),
              React.createElement("section", { className: "playground-project-overview-sidebar-card" },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Resources")
                ),
                React.createElement("div", { className: "playground-project-overview-sidebar-resource-list" },
                  sidebarResources.map(renderProjectOverviewSidebarResourceRow)
                )
              ),
              React.createElement("section", { className: "playground-project-overview-sidebar-card" },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Milestones"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-sidebar-icon-button",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (typeof setProjectOverviewMilestoneMenuId === "function") {
                        setProjectOverviewMilestoneMenuId("");
                      }
                      if (typeof openReleaseComposer === "function") {
                        openReleaseComposer();
                      }
                    },
                    title: "Add milestone",
                    "aria-label": "Add milestone",
                  }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }))
                ),
                releaseSections.length > 0
                  ? React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                      releaseSections.map((section) => {
                        const releaseId = String(section.releaseId || "").trim();
                        const menuId = "milestone:" + (releaseId || section.key || "");
                        const isMenuOpen = projectOverviewMilestoneMenuId === menuId;
                        return React.createElement("div", {
                          key: section.key,
                          className: "playground-project-overview-sidebar-row playground-project-overview-sidebar-milestone-row",
                        },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-project-overview-sidebar-milestone-trigger",
                            onClick: () => {
                              if (typeof setSelectedReleaseId === "function") {
                                setSelectedReleaseId(releaseId);
                              }
                              if (typeof setTaskView === "function") {
                                setTaskView("backlog");
                              }
                            },
                          },
                            React.createElement("div", { className: "playground-project-overview-sidebar-row-value is-full" },
                              React.createElement("span", { className: "playground-project-overview-sidebar-chip" },
                                section.title,
                                React.createElement("span", { className: "playground-project-overview-sidebar-muted" }, String(section.tasks.length))
                              )
                            )
                          ),
                          renderPlaygroundPlatformPopup({
                            open: isMenuOpen,
                            shellClassName: "playground-project-overview-sidebar-milestone-menu-shell",
                            menuClassName: "playground-project-overview-sidebar-milestone-menu",
                            menuProps: {
                              onClick: (event) => event.stopPropagation(),
                            },
                            trigger: React.createElement("button", {
                              type: "button",
                              className: "playground-project-overview-sidebar-icon-button",
                              onClick: (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (typeof setProjectOverviewMilestoneMenuId === "function") {
                                  setProjectOverviewMilestoneMenuId((current) => current === menuId ? "" : menuId);
                                }
                              },
                              title: "Milestone actions",
                              "aria-label": "Milestone actions for " + (section.title || "milestone"),
                              "aria-expanded": isMenuOpen ? "true" : "false",
                            }, React.createElement(EllipsisVertical, { width: 14, height: 14, strokeWidth: 1.8 })),
                            children: React.createElement("button", {
                                    type: "button",
                                    className: "tb-popup-row playground-project-team-menu-item is-danger",
                                    disabled: !releaseId,
                                    onClick: (event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      if (typeof setProjectOverviewMilestoneMenuId === "function") {
                                        setProjectOverviewMilestoneMenuId("");
                                      }
                                      if (releaseId && typeof handleDeleteRelease === "function") {
                                        void handleDeleteRelease(releaseId);
                                      }
                                    },
                                  },
                                    React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Delete milestone")
                                  ),
                          })
                        );
                      })
                    )
                  : React.createElement("div", { className: "playground-project-overview-sidebar-empty" }, "No milestone")
              )
            );
          }

          function renderProjectOverviewStrategyPanel() {
            const strategyBrief = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft);
            const hasStrategyDocument = Boolean(String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim());

            function getOutcomeTasks(outcome) {
              const releaseIds = new Set(getProjectOverviewOutcomeReleaseIds(outcome));
              if (releaseIds.size === 0) {
                return [];
              }
              return normalizedOverviewTasks.filter((task) => releaseIds.has(String(task?.releaseId || "").trim()));
            }

            function getOutcomeTaskProgressValue(task) {
              const status = getTaskBoardStatus(task);
              if (status === "done") return 100;
              if (status === "in_review") return 80;
              if (status === "in_progress") return 50;
              return 0;
            }

            function getOutcomeProgressInfo(outcome) {
              const outcomeTasks = getOutcomeTasks(outcome);
              const doneTasks = outcomeTasks.filter((task) => getTaskBoardStatus(task) === "done");
              const progress = outcomeTasks.length > 0
                ? Math.round(outcomeTasks.reduce((sum, task) => sum + getOutcomeTaskProgressValue(task), 0) / outcomeTasks.length)
                : 0;
              return {
                tasks: outcomeTasks,
                doneTasks,
                progress,
                isAchieved: outcomeTasks.length > 0 && doneTasks.length === outcomeTasks.length,
              };
            }

            function openProjectOverviewOutcomeEditor(outcome, index) {
              if (typeof setProjectOverviewOutcomeEditorState === "function") {
                setProjectOverviewOutcomeEditorState({
                  index,
                  draft: buildProjectOverviewOutcomeEditorDraft(outcome, index),
                });
              }
            }

            function openProjectOverviewNewOutcomeEditor() {
              const nextIndex = strategyBrief.outcomes.length;
              if (typeof setProjectOverviewOutcomeEditorState === "function") {
                setProjectOverviewOutcomeEditorState({
                  index: nextIndex,
                  isNew: true,
                  draft: buildProjectOverviewOutcomeEditorDraft({
                    id: "outcome-" + String(nextIndex + 1).padStart(2, "0"),
                    title: "",
                    description: "",
                    successCriteria: [],
                    releaseIds: [],
                    releaseId: "",
                  }, nextIndex),
                });
              }
            }

            function updateProjectOverviewOutcomeEditorDraft(updates) {
              if (typeof setProjectOverviewOutcomeEditorState !== "function") return;
              setProjectOverviewOutcomeEditorState((current) => current
                ? {
                    ...current,
                    draft: {
                      ...(current.draft || {}),
                      ...(updates || {}),
                    },
                  }
                : current
              );
            }

            function buildProjectOverviewOutcomeEditorDraft(outcome, index = 0) {
              const normalizedDraft = normalizePlaygroundStrategyOutcomeRecord(outcome, index);
              return {
                ...normalizedDraft,
                successCriteriaInput: serializePlaygroundStrategyListForInput(normalizedDraft.successCriteria),
              };
            }

            function getProjectOverviewOutcomeEditorDraft(index = 0) {
              const rawDraft = projectOverviewOutcomeEditorState?.draft || {};
              const normalizedDraft = normalizePlaygroundStrategyOutcomeRecord(rawDraft, index);
              return {
                ...normalizedDraft,
                title: typeof rawDraft.title === "string" ? rawDraft.title : normalizedDraft.title,
                description: typeof rawDraft.description === "string" ? rawDraft.description : normalizedDraft.description,
                successCriteriaInput: typeof rawDraft.successCriteriaInput === "string"
                  ? rawDraft.successCriteriaInput
                  : serializePlaygroundStrategyListForInput(normalizedDraft.successCriteria),
              };
            }

            function normalizeProjectOverviewOutcomeEditorDraftForSave(rawDraft, index = 0) {
              return normalizePlaygroundStrategyOutcomeRecord({
                ...(rawDraft || {}),
                taskIds: [],
                successCriteria: typeof rawDraft?.successCriteriaInput === "string"
                  ? normalizePlaygroundStrategyTextList(rawDraft.successCriteriaInput)
                  : rawDraft?.successCriteria,
              }, index);
            }

            async function saveProjectOverviewOutcomeEditor() {
              const index = Number(projectOverviewOutcomeEditorState?.index);
              const draft = normalizeProjectOverviewOutcomeEditorDraftForSave(projectOverviewOutcomeEditorState?.draft, index);
              if (!Number.isInteger(index) || index < 0 || index > strategyBrief.outcomes.length) {
                if (typeof setProjectOverviewOutcomeEditorState === "function") {
                  setProjectOverviewOutcomeEditorState(null);
                }
                return;
              }
              const isNewOutcome = projectOverviewOutcomeEditorState?.isNew === true || index >= strategyBrief.outcomes.length;
              const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
                ...missionControlStrategyDraft,
                outcomes: isNewOutcome
                  ? strategyBrief.outcomes.concat(draft)
                  : strategyBrief.outcomes.map((outcome, outcomeIndex) => outcomeIndex === index ? draft : outcome),
              });
              if (typeof setMissionControlStrategyDraft === "function") {
                setMissionControlStrategyDraft(nextStrategyBrief);
              }
              try {
                await saveMissionControlStrategyBrief(nextStrategyBrief, { throwOnError: true });
              } catch (error) {
                if (typeof setMissionControlSaveState === "function") {
                  setMissionControlSaveState({
                    isSaving: false,
                    error: error instanceof Error ? error.message : "Failed to save outcome.",
                    message: "",
                  });
                }
                return;
              }
              if (typeof setProjectOverviewOutcomeEditorState === "function") {
                setProjectOverviewOutcomeEditorState(null);
              }
            }

            function deleteProjectOverviewOutcomeEditor() {
              const index = Number(projectOverviewOutcomeEditorState?.index);
              if (projectOverviewOutcomeEditorState?.isNew !== true && Number.isInteger(index) && index >= 0) {
                removeMissionControlStrategyOutcome(index);
              }
              if (typeof setProjectOverviewOutcomeEditorState === "function") {
                setProjectOverviewOutcomeEditorState(null);
              }
            }

            function updateProjectOverviewOutcomeMilestone(releaseId) {
              const normalizedReleaseId = String(releaseId || "").trim();
              const currentReleaseIds = getProjectOverviewOutcomeReleaseIds(projectOverviewOutcomeEditorState?.draft || {});
              const nextReleaseIds = normalizedReleaseId
                ? (currentReleaseIds.includes(normalizedReleaseId)
                    ? currentReleaseIds.filter((id) => id !== normalizedReleaseId)
                    : currentReleaseIds.concat(normalizedReleaseId))
                : [];
              updateProjectOverviewOutcomeEditorDraft({
                releaseIds: nextReleaseIds,
                releaseId: nextReleaseIds[0] || "",
                taskIds: [],
              });
            }

            function renderOutcomePreviewRow(outcome, index) {
              const progressInfo = getOutcomeProgressInfo(outcome);
              const outcomeNumber = String(index + 1).padStart(3, "0");
              const outcomeReleaseIds = getProjectOverviewOutcomeReleaseIds(outcome);
              const linkedMilestones = outcomeReleaseIds
                .map((releaseId) => releasesById[releaseId] || null)
                .filter(Boolean);
              const linkedMilestoneCount = linkedMilestones.length;
              const linkedMilestoneLabel = String(linkedMilestoneCount) + " " + (linkedMilestoneCount === 1 ? "milestone" : "milestones");
              const linkedTicketLabel = String(progressInfo.doneTasks.length) + "/" + String(progressInfo.tasks.length) + " tickets done";
              const linkedLabel = linkedMilestoneLabel + " · " + linkedTicketLabel;
              return React.createElement("div", {
                  key: outcome.id || index,
                  className: "playground-tasks-backlog-item playground-project-overview-outcome-preview",
                  role: "button",
                  tabIndex: 0,
                  onClick: () => openProjectOverviewOutcomeEditor(outcome, index),
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProjectOverviewOutcomeEditor(outcome, index);
                    }
                  },
                },
                React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                  React.createElement("div", { className: "playground-tasks-backlog-leading" },
                    React.createElement(PlaygroundProjectOverviewOutcomeProgressRing, {
                      progress: progressInfo.progress,
                      label: "Outcome " + outcomeNumber + " progress " + String(progressInfo.progress) + "%",
                    }),
                    React.createElement("div", { className: "playground-tasks-backlog-main" },
                      React.createElement("span", { className: "playground-tasks-backlog-ticket" }, "Outcome " + outcomeNumber),
                      React.createElement("span", { className: "playground-tasks-backlog-title" }, outcome.title || "Untitled Outcome")
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-backlog-meta" },
                    React.createElement("span", { className: "playground-tasks-backlog-ticket" }, linkedLabel)
                  )
                )
              );
            }

            function renderProjectOverviewOutcomeEditorModal() {
              if (typeof renderSharedProjectOverviewOutcomeEditorModal === "function") {
                return renderSharedProjectOverviewOutcomeEditorModal({
                  normalizedOverviewTasks,
                  strategyBrief,
                });
              }
              const index = Number(projectOverviewOutcomeEditorState?.index);
              const draft = getProjectOverviewOutcomeEditorDraft(index);
              if (!projectOverviewOutcomeEditorState || !Number.isInteger(index) || index < 0) {
                return null;
              }
              const selectedReleaseIds = getProjectOverviewOutcomeReleaseIds(draft);
              const selectedReleaseIdSet = new Set(selectedReleaseIds);
              const selectedReleaseTasksById = selectedReleaseIds.reduce((result, releaseId) => {
                const releaseTasks = normalizedOverviewTasks.filter((task) => String(task?.releaseId || "").trim() === releaseId);
                result[releaseId] = {
                  tasks: releaseTasks,
                  doneTasks: releaseTasks.filter((task) => getTaskBoardStatus(task) === "done"),
                };
                return result;
              }, {});
              const content = React.createElement("div", {
                  className: "playground-tasks-project-modal-backdrop",
                  onClick: () => setProjectOverviewOutcomeEditorState(null),
                },
                React.createElement("form", {
                    className: "playground-tasks-project-modal playground-project-overview-outcome-editor-modal",
                    onClick: (event) => event.stopPropagation(),
                    onSubmit: (event) => {
                      event.preventDefault();
                      void saveProjectOverviewOutcomeEditor();
                    },
                  },
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                        React.createElement(Award, { width: 18, height: 18, strokeWidth: 1.9 })
                      ),
                      React.createElement("div", { className: "playground-content-title playground-tasks-project-modal-name-input", style: { display: "flex", alignItems: "center" } }, "Edit Outcome")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: () => setProjectOverviewOutcomeEditorState(null),
                      title: "Close",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-project-overview-outcome-editor-body" },
                    React.createElement("label", { className: "playground-tasks-project-modal-field" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Title"),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-environments-input",
                        value: draft.title,
                        placeholder: "Outcome title",
                        onChange: (event) => updateProjectOverviewOutcomeEditorDraft({ title: event.target.value }),
                      })
                    ),
                    React.createElement("label", { className: "playground-tasks-project-modal-field" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Description"),
                      React.createElement("textarea", {
                        className: "playground-environments-textarea",
                        rows: 4,
                        value: draft.description,
                        placeholder: "What this outcome should achieve",
                        onChange: (event) => updateProjectOverviewOutcomeEditorDraft({ description: event.target.value }),
                      })
                    ),
                    React.createElement("label", { className: "playground-tasks-project-modal-field" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Success Criteria"),
                      React.createElement("textarea", {
                        className: "playground-environments-textarea",
                        rows: 3,
                        value: draft.successCriteriaInput,
                        placeholder: "One success criterion per line",
                        onChange: (event) => updateProjectOverviewOutcomeEditorDraft({ successCriteriaInput: event.target.value }),
                      })
                    ),
                    React.createElement("div", { className: "playground-tasks-project-modal-field" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Linked Milestones"),
                      React.createElement("div", { className: "playground-project-overview-outcome-ticket-list" },
                        releases.length > 0
                          ? releases.map((release) => {
                              const isSelected = selectedReleaseIdSet.has(release.id);
                              const releaseTaskInfo = selectedReleaseTasksById[release.id] || { tasks: [], doneTasks: [] };
                              return React.createElement("button", {
                                  key: release.id,
                                  type: "button",
                                  className: "playground-project-overview-outcome-ticket-row" + (isSelected ? " is-selected" : ""),
                                  onClick: () => updateProjectOverviewOutcomeMilestone(release.id),
                                },
                                React.createElement("span", { className: "playground-project-overview-outcome-ticket-check" },
                                  isSelected
                                    ? React.createElement(Check, { width: 11, height: 11, strokeWidth: 2.1 })
                                    : null
                                ),
                                React.createElement("span", { className: "playground-project-overview-outcome-ticket-title" },
                                  release.name || "Untitled Milestone"
                                ),
                                React.createElement("span", { className: "playground-project-overview-outcome-ticket-status" },
                                  releaseTaskInfo.tasks.length
                                    ? releaseTaskInfo.doneTasks.length + "/" + releaseTaskInfo.tasks.length + " tickets done"
                                    : "No tickets"
                                )
                              );
                            })
                          : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No milestones in this project yet."),
                        selectedReleaseIds.length > 0
                          ? React.createElement("button", {
                              type: "button",
                              className: "playground-project-overview-outcome-ticket-row",
                              onClick: () => updateProjectOverviewOutcomeMilestone(""),
                            }, "Unlink all milestones")
                          : null
                      )
                    )
                  ),
                  missionControlSaveState?.error
                    ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, missionControlSaveState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button playground-project-overview-outcome-delete-button",
                      onClick: deleteProjectOverviewOutcomeEditor,
                    }, "Delete"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: () => setProjectOverviewOutcomeEditorState(null),
                    }, "Cancel"),
                    React.createElement("button", {
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: missionControlSaveState.isSaving || !String(draft.title || "").trim(),
                    }, "Save Outcome")
                  )
                )
              );
              if (typeof document !== "undefined" && document.body) {
                return createPortal(content, document.body);
              }
              return content;
            }

            const outcomeProgressItems = strategyBrief.outcomes.map((outcome, index) => ({
              outcome,
              index,
              ...getOutcomeProgressInfo(outcome),
            }));
            const allOutcomesCount = outcomeProgressItems.length;
            const achievedOutcomesCount = outcomeProgressItems.filter((item) => item.isAchieved).length;
            const notAchievedOutcomesCount = Math.max(0, allOutcomesCount - achievedOutcomesCount);
            const linkedMilestoneIds = new Set();
            outcomeProgressItems.forEach((item) => {
              getProjectOverviewOutcomeReleaseIds(item.outcome).forEach((releaseId) => {
                if (releasesById[releaseId]) {
                  linkedMilestoneIds.add(releaseId);
                }
              });
            });
            const projectReadinessPercent = allOutcomesCount > 0
              ? Math.round((achievedOutcomesCount / allOutcomesCount) * 100)
              : 0;
            const strategyKpis = [
              { id: "all", value: String(allOutcomesCount), label: "All Outcomes", dotClassName: "is-scope" },
              { id: "open", value: String(notAchievedOutcomesCount), label: "Not Achieved Yet", dotClassName: "is-started" },
              { id: "readiness", value: String(projectReadinessPercent) + "%", label: "Project Readiness", dotClassName: "is-completed" },
              { id: "mapped", value: String(linkedMilestoneIds.size), label: "Linked Milestones", dotClassName: "is-cost" },
            ];

            return React.createElement("section", {
                className: "playground-project-overview-strategy-tab",
                ref: projectOverviewStrategySurfaceRef,
              },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-project-overview-strategy-scroll" },
                React.createElement("div", { className: "playground-project-overview-strategy-brief" },
                  React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-project-overview-strategy-progress-card" },
                    React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
                      React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, "Outcomes"),
                      React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-project-overview-progress-combo-download playground-project-overview-add-outcome-button",
                          title: "Add Outcome",
                          "aria-label": "Add Outcome",
                          onClick: openProjectOverviewNewOutcomeEditor,
                        },
                          React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 })
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
                      strategyKpis.map((item) =>
                        React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                          React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                            React.createElement("span", { className: "playground-project-overview-progress-combo-metric-dot " + item.dotClassName, "aria-hidden": "true" }),
                            React.createElement("span", null, item.label)
                          ),
                          React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-project-overview-progress-combo-chart" },
                      strategyBrief.outcomes.length > 0
                        ? React.createElement("div", { className: "playground-project-overview-outcome-list" },
                            strategyBrief.outcomes.map((outcome, index) => renderOutcomePreviewRow(outcome, index))
                          )
                        : React.createElement("div", { className: "playground-tasks-empty playground-project-overview-rules-empty" },
                            React.createElement("div", { className: "playground-tasks-empty-title" }, "No outcomes yet"),
                            React.createElement("div", { className: "playground-tasks-empty-copy" },
                              "Add outcomes manually or run Mission Control to turn the strategy into measurable project outcomes."
                            )
                          )
                    )
                  ),
                  React.createElement("div", { className: "playground-project-overview-strategy-card is-notes is-full-strategy-notes" },
                    React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-project-overview-strategy-notes playground-project-strategy-notes-section" },
                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Strategy Notes"),
                        React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                          renderMissionControlDocumentToolbarButton({
                            id: "undo",
                            label: "Undo",
                            icon: Undo2,
                            disabled: !canUndoMissionControlDocument,
                            onClick: handleMissionControlDocumentUndo,
                          }),
                          renderMissionControlDocumentToolbarButton({
                            id: "redo",
                            label: "Redo",
                            icon: Redo2,
                            disabled: !canRedoMissionControlDocument,
                            onClick: handleMissionControlDocumentRedo,
                          }),
                          React.createElement("span", {
                            key: "history-divider",
                            className: "playground-agents-detail-instructions-toolbar-divider",
                            "aria-hidden": "true",
                          }),
                          missionControlDocumentTextFormatActions.map((action) =>
                            renderMissionControlDocumentToolbarButton({
                              ...action,
                              onClick: () => handleMissionControlDocumentFormat(action.id),
                            })
                          ),
                          React.createElement("span", {
                            key: "list-divider-start",
                            className: "playground-agents-detail-instructions-toolbar-divider",
                            "aria-hidden": "true",
                          }),
                          missionControlDocumentListFormatActions.map((action) =>
                            renderMissionControlDocumentToolbarButton({
                              ...action,
                              onClick: () => handleMissionControlDocumentFormat(action.id),
                            })
                          ),
                          React.createElement("span", {
                            key: "list-divider-end",
                            className: "playground-agents-detail-instructions-toolbar-divider",
                            "aria-hidden": "true",
                          }),
                          missionControlDocumentInsertFormatActions.map((action) =>
                            renderMissionControlDocumentToolbarButton({
                              ...action,
                              onClick: () => handleMissionControlDocumentFormat(action.id),
                            })
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isMissionControlDocumentEditing ? " is-editing" : " is-preview") },
                        !isMissionControlDocumentEditing
                          ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                              hasStrategyDocument
                                ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: missionControlDocumentDraft,
                                    className: "playground-tasks-detail-description-preview tb-message-markdown",
                                  })
                                : React.createElement("div", {
                                    className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                  }, "Run Mission Control first to generate the project strategy and backlog plan.")
                            )
                          : null,
                        React.createElement("textarea", {
                          ref: missionControlDocumentTextareaRef,
                          className: "playground-tasks-detail-description-input " + (isMissionControlDocumentEditing ? "is-editing" : "is-preview"),
                          rows: 1,
                          placeholder: isMissionControlDocumentEditing ? "Add Strategy here" : "",
                          value: missionControlDocumentDraft,
                          onFocus: () => {
                            setIsMissionControlDocumentEditing(true);
                          },
                          onChange: (event) => {
                            updateMissionControlDocumentDraftValue(event.target.value, {
                              previousValue: missionControlDocumentDraft,
                            });
                            resizeTaskDescriptionTextarea(event.currentTarget);
                          },
                          onBlur: () => {
                            setIsMissionControlDocumentEditing(false);
                            commitMissionControlDocumentIfDirty();
                          },
                        })
                      )
                    )
                  )
                ),
                renderProjectOverviewOutcomeEditorModal()
              )
	            );
	          }

	          function renderProjectOverviewRulesPanel(options = {}) {
	            const isInline = Boolean(options?.inline);
	            const isReadOnly = Boolean(options?.readOnly);
	            const ruleEntries = splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules);
	            const canAddRule = !isReadOnly
	              && Boolean(normalizePlaygroundProjectRuleEntry(projectRuleInputValue))
	              && !projectRulesSaveState.isSaving;

	            function closeProjectOverviewRuleComposer() {
	              if (typeof closeProjectRuleComposer === "function") {
	                closeProjectRuleComposer();
	                return;
	              }
	              setProjectRuleComposerOpen(false);
	              setProjectRuleInputValue("");
	            }

	            function renderProjectOverviewRuleComposerModal() {
	              if (isReadOnly || !projectRuleComposerOpen) {
	                return null;
	              }
	              const content = React.createElement("div", {
	                  className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-rule-editor-backdrop"
	                    + (projectRuleComposerVisible ? " is-visible" : "")
	                    + (projectRuleComposerClosing ? " is-closing" : ""),
	                  onClick: (event) => {
	                    if (event.target === event.currentTarget) {
	                      closeProjectOverviewRuleComposer();
	                    }
	                  },
	                },
	                React.createElement("form", {
	                    className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-project-overview-rule-editor-modal"
	                      + (projectRuleComposerVisible ? " is-visible" : "")
	                      + (projectRuleComposerClosing ? " is-closing" : ""),
	                    role: "dialog",
	                    "aria-modal": "true",
	                    "aria-label": "Add Rule",
	                    onMouseDown: (event) => event.stopPropagation(),
	                    onClick: (event) => event.stopPropagation(),
	                    onSubmit: (event) => {
	                      event.preventDefault();
	                      void handleAddProjectRuleEntry();
	                    },
	                  },
	                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
	                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
	                      React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
	                        React.createElement(Shield, { width: 18, height: 18, strokeWidth: 1.9 })
	                      ),
	                      React.createElement("div", { className: "playground-content-title playground-tasks-project-modal-name-input", style: { display: "flex", alignItems: "center" } }, "Add Rule")
	                    ),
	                    React.createElement("button", {
	                      type: "button",
	                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
	                      onClick: closeProjectOverviewRuleComposer,
	                      title: "Close",
	                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
	                  ),
	                  React.createElement("div", { className: "playground-tasks-issue-modal-body playground-project-overview-rule-editor-body" },
	                    React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-project-overview-rule-description-editor" },
	                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
	                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Rule"),
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
	                              onMouseDown: (event) => event.preventDefault(),
	                              onClick: () => handleProjectRuleComposerFormat(action.id),
	                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
	                          )
	                        )
	                      ),
	                      React.createElement("div", { className: "playground-tasks-detail-description-editor is-editing" },
	                      React.createElement("textarea", {
	                        ref: projectRuleComposerTextareaRef,
	                          className: "playground-tasks-detail-description-input is-editing playground-project-overview-rule-modal-textarea",
	                        rows: 4,
	                        value: projectRuleInputValue,
	                        placeholder: "Describe the rule agents should follow in this project",
	                        onChange: (event) => {
	                          setProjectRuleInputValue(event.target.value);
	                          resizeTaskDescriptionTextarea(event.currentTarget);
	                        },
	                        onKeyDown: (event) => {
	                          if (event.key === "Escape") {
	                            event.preventDefault();
	                            closeProjectOverviewRuleComposer();
	                          }
	                        },
	                      })
	                      )
	                    )
	                  ),
	                  projectRulesSaveState?.error
	                    ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, projectRulesSaveState.error)
	                    : null,
	                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
	                    React.createElement("button", {
	                      type: "button",
	                      className: "playground-environments-action-button",
	                      onClick: closeProjectOverviewRuleComposer,
	                    }, "Cancel"),
	                    React.createElement("button", {
	                      type: "submit",
	                      className: "playground-environments-action-button is-primary",
	                      disabled: !canAddRule,
	                    }, projectRulesSaveState.isSaving ? "Saving..." : "Add Rule")
	                  )
	                )
	              );
	              if (typeof document !== "undefined" && document.body) {
	                return createPortal(content, document.body);
	              }
	              return content;
	            }

	            return React.createElement("section", {
	                className: "playground-project-overview-rules-tab" + (isInline ? " is-inline" : ""),
	                ref: isInline ? null : projectOverviewRulesSurfaceRef,
	              },
	              React.createElement("div", { className: "playground-project-overview-rules-list" },
	                ruleEntries.length > 0
	                  ? ruleEntries.map((entry, index) =>
	                      React.createElement("div", {
	                        key: String(index) + ":" + entry.slice(0, 48),
	                        className: "playground-tasks-backlog-item playground-project-overview-rule-item",
	                      },
	                        React.createElement("div", { className: "playground-tasks-backlog-item-content" },
	                          React.createElement("div", { className: "playground-tasks-backlog-leading" },
	                            React.createElement("span", { className: "playground-tasks-backlog-project-icon is-task" },
	                              React.createElement(Shield, { width: 13, height: 13, strokeWidth: 1.8 })
	                            )
	                          ),
	                          React.createElement("div", { className: "playground-tasks-backlog-main playground-project-overview-rule-main" },
	                            !isReadOnly && projectRuleEditingIndex === index
	                              ? React.createElement("textarea", {
	                                  ref: projectRuleEditTextareaRef,
	                                  rows: 1,
	                                  className: "playground-project-overview-rule-edit-input",
	                                  value: projectRuleEditingValue,
	                                  placeholder: "Add project rule",
	                                  onChange: (event) => {
	                                    setProjectRuleEditingValue(event.target.value);
	                                    resizeTaskDescriptionTextarea(event.currentTarget);
	                                  },
	                                  onBlur: () => {
	                                    void commitProjectRuleEntryEdit(index);
	                                  },
	                                  onKeyDown: (event) => {
	                                    if (event.key === "Enter" && !event.shiftKey) {
	                                      event.preventDefault();
	                                      event.currentTarget.blur();
	                                      return;
	                                    }
	                                    if (event.key === "Escape") {
	                                      event.preventDefault();
	                                      cancelProjectRuleEntryEdit();
	                                    }
	                                  },
	                                })
	                              : React.createElement("div", {
	                                  className: "playground-project-overview-rule-copy tb-runner-chat" + (isReadOnly ? " is-read-only" : ""),
	                                  ...(isReadOnly ? {} : {
	                                    role: "button",
	                                    tabIndex: 0,
	                                    onClick: () => beginProjectRuleEntryEdit(index, entry),
	                                    onKeyDown: (event) => {
	                                      if (event.key === "Enter" || event.key === " ") {
	                                        event.preventDefault();
	                                        beginProjectRuleEntryEdit(index, entry);
	                                      }
	                                    },
	                                  }),
	                                },
	                                  React.createElement(PlaygroundTaskDescriptionMarkdown, {
	                                    content: entry,
	                                    className: "tb-message-markdown",
	                                  })
	                                )
	                          ),
	                          isReadOnly
	                            ? null
	                            : React.createElement("div", { className: "playground-tasks-backlog-meta" },
	                                React.createElement("button", {
	                                  type: "button",
	                                  className: "playground-project-overview-rule-remove",
	                                  onClick: () => void handleRemoveProjectRuleEntry(index),
	                                  disabled: projectRulesSaveState.isSaving,
	                                  title: "Remove rule",
	                                  "aria-label": "Remove rule " + String(index + 1),
	                                }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
	                              )
	                        )
	                      )
	                    )
	                  : React.createElement("div", { className: "playground-tasks-empty playground-tasks-backlog-empty playground-project-overview-rules-empty" },
	                      React.createElement("div", { className: "playground-tasks-empty-title" }, "Rules are empty"),
	                      React.createElement("div", { className: "playground-tasks-empty-copy" },
	                        "Add project rules for repository conventions, deployment expectations, commit policy, communication style, or other operating constraints."
	                      )
	                    ),
	                projectRulesSaveState.error
	                  ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, projectRulesSaveState.error)
	                  : projectRulesSaveState.isSaving
	                    ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Saving changes...")
	                    : null
	              ),
	              renderProjectOverviewRuleComposerModal()
	            );
	          }

	          function renderProjectOverviewSettingsRulesSection(options = {}) {
	            const canEditRules = options?.canEdit !== false;
	            return React.createElement("section", {
	                className: "playground-project-settings-section playground-project-settings-rules-section" + (canEditRules ? "" : " is-read-only"),
	              },
	              React.createElement("div", { className: "playground-project-overview-strategy-add-row playground-project-overview-rules-inline-title-row" },
	                React.createElement("h2", { className: "playground-project-overview-strategy-add-title" }, "Rules"),
	                canEditRules
	                  ? React.createElement("button", {
	                      type: "button",
	                      className: "playground-files-control-button playground-project-teams-add-button playground-project-settings-add-rule-button",
	                      onClick: () => {
	                        if (typeof setProjectRuleInputValue === "function") {
	                          setProjectRuleInputValue("");
	                        }
	                        if (typeof setProjectRuleComposerOpen === "function") {
	                          setProjectRuleComposerOpen(true);
	                        }
	                        window.requestAnimationFrame(() => {
	                          const textarea = projectRuleComposerTextareaRef.current;
	                          if (!textarea) return;
	                          textarea.focus();
	                          resizeTaskDescriptionTextarea(textarea);
	                        });
	                      },
	                    },
	                      React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
	                      React.createElement("span", null, "Add Rule")
	                    )
	                  : null
	              ),
	              renderProjectOverviewRulesPanel({ inline: true, readOnly: !canEditRules })
	            );
	          }

	          function renderProjectOverviewPermissionsPanel() {
	            if (!canViewProjectSettings) {
	              return null;
	            }
	            const projectPermissionSet = normalizePlaygroundPermissionSet(
	              projectOverviewDraft?.permissionSet
	                || projectOverviewDraft?.metadata?.permissionSet
	                || selectedProject?.permissionSet
	                || selectedProject?.metadata?.permissionSet,
	              "project"
	            );
	            const projectMetadata = projectOverviewDraft?.metadata && typeof projectOverviewDraft.metadata === "object" && !Array.isArray(projectOverviewDraft.metadata)
	              ? projectOverviewDraft.metadata
	              : {};
	            const projectTeamPermissionSets = projectMetadata.teamPermissionSets
	              && typeof projectMetadata.teamPermissionSets === "object"
	              && !Array.isArray(projectMetadata.teamPermissionSets)
	                ? projectMetadata.teamPermissionSets
	                : {};
	            const projectTeamRolePermissionSets = projectMetadata.teamRolePermissionSets
	              && typeof projectMetadata.teamRolePermissionSets === "object"
	              && !Array.isArray(projectMetadata.teamRolePermissionSets)
	                ? projectMetadata.teamRolePermissionSets
	                : {};
	            const availableWorkspaceTeams = Array.isArray(workspaceTeams)
	              ? workspaceTeams
	              : [];
	            const projectRemovedTeamIds = new Set(
	              (Array.isArray(projectMetadata.teamAccessRemovedIds) ? projectMetadata.teamAccessRemovedIds : [])
	                .map((teamId) => String(teamId || "").trim())
	                .filter(Boolean)
	            );
	            const removedWorkspaceTeams = availableWorkspaceTeams
	              .map((team) => {
	                const teamId = String(team?.id || "").trim();
	                return teamId && projectRemovedTeamIds.has(teamId) ? { ...team, id: teamId } : null;
	              })
	              .filter(Boolean);
	            const projectPermissionTeams = [
	              {
	                id: "all_agents",
	                name: "All Agents",
	                meta: "Always included",
	                permission: "Project default",
	                createdAt: "",
	                locked: true,
	                permissionSet: projectPermissionSet,
	              },
	              ...availableWorkspaceTeams.map((team) => {
	                const teamId = String(team?.id || "").trim();
	                if (!teamId || projectRemovedTeamIds.has(teamId)) {
	                  return null;
	                }
	                return {
	                  id: teamId,
	                  name: team?.name || "Untitled team",
	                  meta: team?.memberCount ? String(team.memberCount) + " members" : "Team workspace",
	                  permission: projectTeamRolePermissionSets[teamId]
	                    ? "Project role override"
	                    : projectTeamPermissionSets[teamId]
	                      ? "Migrated role policy"
	                      : "Role policies",
	                  createdAt: team?.createdAt || "",
	                  locked: false,
	                  rolePermissionSets: getProjectTeamRolePermissionSets(projectOverviewDraft || selectedProject, teamId),
	                };
	              }).filter(Boolean),
	            ];
	            const formatProjectTeamCreatedDate = (value) => {
	              if (!value) {
	                return "";
	              }
	              try {
	                return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
	              } catch {
	                return String(value || "");
	              }
	            };
	            const selectedPermissionTeam = projectPermissionTeams.find((team) =>
	              String(team.id) === String(projectOverviewPermissionTeamId || "")
	            ) || null;
            const renderReducedProjectRoleView = () => {
              const reducedTeamId = projectOverviewSharedTeamId;
              const reducedWorkspaceTeam = reducedTeamId
                ? availableWorkspaceTeams.find((team) => String(team?.id || "").trim() === reducedTeamId)
                : null;
              const reducedTeamName = String(
                projectOverviewSharedTeamName
                || reducedWorkspaceTeam?.name
                || "Team access"
              ).trim() || "Team access";
              const reducedRoleId = normalizePlaygroundTeamRoleId(projectOverviewViewerProjectRoleId, "member");
              const selectedRoleDefinition = getPlaygroundTeamRoleDefinition(reducedRoleId);
              const reducedRolePermissionSets = getProjectTeamRolePermissionSets(projectOverviewDraft || selectedProject, reducedTeamId);
              const selectedRolePermissionSet = normalizePlaygroundPermissionSet(
                reducedRolePermissionSets[selectedRoleDefinition.id],
                "project_team_role"
              );
              const projectRulesViewAction = getPlaygroundPermissionActionDefinition("project_rules_view");
              const projectRulesEditAction = getPlaygroundPermissionActionDefinition("project_rules_edit");
              const projectRulesViewAccess = projectRulesViewAction
                ? getPlaygroundPermissionActionAccess(selectedRolePermissionSet, projectRulesViewAction)
                : "full_access";
              const projectRulesEditAccess = projectRulesEditAction
                ? getPlaygroundPermissionActionAccess(selectedRolePermissionSet, projectRulesEditAction)
                : "no_access";
              const canViewProjectRules = projectRulesViewAccess !== "no_access";
              const canEditProjectRules = projectRulesEditAccess === "full_access";
              const openReducedProjectTeamRolePage = () => {
                if (!reducedTeamId) {
                  return;
                }
                onOpenTeamPage?.(reducedTeamId, {
                  tab: "roles",
                  roleId: selectedRoleDefinition.id,
                });
              };
              return React.createElement("section", {
                  className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-teams-section playground-project-settings-root playground-project-settings-reduced-access-root",
                },
                canViewProjectRules
                  ? renderProjectOverviewSettingsRulesSection({ canEdit: canEditProjectRules })
                  : null,
                React.createElement("section", {
                    className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-permissions-section playground-project-teams-section playground-project-settings-reduced-access",
                  },
                  React.createElement("div", { className: "playground-team-role-permission-page playground-project-team-role-permission-page" },
	                    React.createElement("div", { className: "playground-team-role-permission-header playground-project-team-role-permission-header" },
	                      React.createElement("div", null,
	                        React.createElement("h2", { className: "playground-team-role-permission-title" }, selectedRoleDefinition.label + " Role")
                      ),
                      reducedTeamId
                        ? React.createElement("button", {
                            type: "button",
                            className: "playground-project-settings-source-button",
                            onClick: openReducedProjectTeamRolePage,
                          }, reducedTeamName)
                        : React.createElement("span", { className: "playground-project-settings-source-button" }, reducedTeamName)
                    ),
                    renderPlaygroundPermissionPanel(selectedRolePermissionSet, {
                      subjectType: "project_team_role",
                      animationKey: projectPermissionChartAnimationKey,
                      disabled: true,
                    })
                  )
                )
              );
            };
            if (hasReducedProjectSettingsAccess) {
              return renderReducedProjectRoleView();
            }
	            const closeProjectTeamMenu = () => setProjectOverviewTeamMenuId?.("");
	            const handleOpenTeamDetails = (team) => {
	              if (!team || team.locked) {
	                return;
	              }
	              closeProjectTeamMenu();
	              onOpenTeamPage?.(team.id);
	            };
	            const handleRemoveProjectTeam = (team) => {
	              if (!team || team.locked || !hasRealAccess) {
	                return;
	              }
	              closeProjectTeamMenu();
	              if (String(projectOverviewPermissionTeamId || "") === String(team.id || "")) {
	                closeProjectOverviewPermissionDetail();
	              }
	              updateProjectTeamWorkspaceMembership?.(team.id, "remove");
	            };
	            const handleAddProjectTeam = (team) => {
	              if (!team || !hasRealAccess) {
	                return;
	              }
	              closeProjectTeamMenu();
	              updateProjectTeamWorkspaceMembership?.(team.id, "add");
	            };
	            const renderProjectTeamMenu = (team) => {
	              const menuId = "team:" + String(team.id || "");
	              if (projectOverviewTeamMenuId !== menuId) {
	                return null;
	              }
	              return React.createElement("div", {
	                  className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-project-team-action-menu playground-tasks-toolbar-popup-menu-animate-down-in",
	                  onClick: (event) => event.stopPropagation(),
	                },
	                team.locked
	                  ? React.createElement("button", {
	                      type: "button",
	                      className: "tb-popup-row playground-project-team-menu-item",
	                      disabled: true,
	                    }, "Default workspace access")
	                  : React.createElement(React.Fragment, null,
	                      React.createElement("button", {
	                        type: "button",
	                        className: "tb-popup-row playground-project-team-menu-item",
	                        onClick: () => handleOpenTeamDetails(team),
	                      },
	                        React.createElement(ExternalLink, { width: 14, height: 14, strokeWidth: 1.8 }),
	                        React.createElement("span", null, "View team")
	                      ),
	                      hasRealAccess
	                        ? React.createElement("button", {
	                            type: "button",
	                            className: "tb-popup-row playground-project-team-menu-item is-danger",
	                            onClick: () => handleRemoveProjectTeam(team),
	                          },
	                            React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }),
	                            React.createElement("span", null, "Remove from project")
	                          )
	                        : null
	                    )
	              );
	            };
	            const renderAddProjectTeamsMenu = () => {
	              if (projectOverviewTeamMenuId !== "add-teams") {
	                return null;
	              }
	              return React.createElement("div", {
	                  className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-project-teams-add-menu playground-tasks-toolbar-popup-menu-animate-down-in",
	                  onClick: (event) => event.stopPropagation(),
	                },
	                removedWorkspaceTeams.length
	                  ? removedWorkspaceTeams.map((team) =>
	                      React.createElement("button", {
	                        key: team.id,
	                        type: "button",
	                        className: "tb-popup-row playground-project-team-menu-item",
	                        onClick: () => handleAddProjectTeam(team),
	                      },
	                        React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.8 }),
	                        React.createElement("span", null, team.name || "Untitled team")
	                      )
	                    )
	                  : React.createElement("button", {
	                      type: "button",
	                      className: "tb-popup-row playground-project-team-menu-item",
	                      disabled: true,
	                    }, workspaceTeamsLoading ? "Loading teams..." : "All teams already have access")
	              );
	            };

	            const renderProjectTeamTable = () =>
	              React.createElement("section", { className: "playground-project-settings-access-section" },
	                React.createElement("div", { className: "playground-project-teams-table-heading" },
	                  React.createElement("h2", { className: "playground-project-teams-table-title" }, "Manage Project Access"),
	                  hasRealAccess
	                    ? React.createElement("div", { className: "playground-tasks-toolbar-popup-shell playground-project-teams-add-shell" + (projectOverviewTeamMenuId === "add-teams" ? " is-open" : "") },
	                        React.createElement("button", {
	                          type: "button",
	                          className: "playground-files-control-button playground-project-teams-add-button",
	                          onClick: (event) => {
	                            event.stopPropagation();
	                            if (!workspaceTeamsLoading) {
	                              requestProjectOverviewWorkspaceTeams?.();
	                            }
	                            setProjectOverviewTeamMenuId?.((current) => current === "add-teams" ? "" : "add-teams");
	                          },
	                          disabled: workspaceTeamsLoading,
	                        },
	                          React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
	                          React.createElement("span", null, "Add Teams")
	                        ),
	                        renderAddProjectTeamsMenu()
	                      )
	                    : null
	                ),
	                React.createElement("div", { className: "playground-auth-users-table-shell playground-team-table-shell playground-project-teams-table-shell" },
	                  React.createElement("table", { className: "playground-auth-users-table is-secrets-table playground-team-table" },
	                    React.createElement("colgroup", null,
	                      React.createElement("col", { className: "playground-team-table-col-main" }),
	                      React.createElement("col", { className: "playground-team-table-col-role" }),
	                      React.createElement("col", { className: "playground-team-table-col-meta" }),
	                      React.createElement("col", { className: "playground-team-table-col-actions" })
	                    ),
	                    React.createElement("thead", null,
	                      React.createElement("tr", null,
	                        React.createElement("th", null, "Team"),
	                        React.createElement("th", null, "Policy"),
	                        React.createElement("th", null, "Created"),
	                        React.createElement("th", { className: "is-actions" }, "")
	                      )
	                    ),
	                    React.createElement("tbody", null,
	                      projectPermissionTeams.map((team) =>
	                        React.createElement("tr", {
	                          key: team.id,
	                          className: "is-clickable" + (projectOverviewTeamMenuId === "team:" + String(team.id || "") ? " is-menu-open" : ""),
	                          tabIndex: 0,
	                          onClick: () => openProjectOverviewPermissionDetail(team),
	                          onKeyDown: (event) => {
	                            if (event.key === "Enter" || event.key === " ") {
	                              event.preventDefault();
	                              openProjectOverviewPermissionDetail(team);
	                            }
	                          },
	                        },
	                          React.createElement("td", null,
	                            React.createElement("div", { className: "playground-team-table-title" }, team.name),
	                            React.createElement("div", { className: "playground-team-table-meta" }, team.meta)
	                          ),
	                          React.createElement("td", { className: "playground-auth-users-cell" }, team.permission),
	                          React.createElement("td", { className: "playground-auth-users-cell" }, team.locked ? "Default" : (formatProjectTeamCreatedDate(team.createdAt) || "—")),
	                          React.createElement("td", { className: "is-actions" },
	                            React.createElement("div", {
	                                className: "playground-tasks-toolbar-popup-shell playground-project-team-action-shell" + (projectOverviewTeamMenuId === "team:" + String(team.id || "") ? " is-open" : ""),
	                              },
	                              React.createElement("button", {
	                                type: "button",
	                                className: "playground-project-team-action-button",
	                                onClick: (event) => {
	                                  event.preventDefault();
	                                  event.stopPropagation();
	                                  const menuId = "team:" + String(team.id || "");
	                                  setProjectOverviewTeamMenuId?.((current) => current === menuId ? "" : menuId);
	                                },
	                                "aria-label": "Team actions for " + team.name,
	                                "aria-expanded": projectOverviewTeamMenuId === "team:" + String(team.id || "") ? "true" : "false",
	                              }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
	                              renderProjectTeamMenu(team)
	                            )
	                          )
	                        )
	                      )
	                    )
	                  )
	                )
	              );

	            if (selectedPermissionTeam) {
	              const isAllAgentsTeam = selectedPermissionTeam.id === "all_agents";
	              const selectedRoleDefinition = getPlaygroundTeamRoleDefinition(projectOverviewPermissionRoleId);
	              const isSelectedOwnerRole = selectedRoleDefinition.id === "owner";
	              const selectedRolePermissionSet = selectedPermissionTeam.rolePermissionSets
	                ? normalizePlaygroundPermissionSet(
	                    selectedPermissionTeam.rolePermissionSets[selectedRoleDefinition.id],
	                    "project_team_role"
	                  )
	                : null;
	              const renderProjectTeamRolePages = () =>
	                React.createElement("div", { className: "playground-team-role-pages playground-project-team-role-pages" },
	                  React.createElement("div", { className: "playground-team-role-list playground-project-team-role-list", role: "tablist", "aria-label": "Project team roles" },
	                    PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) =>
	                      React.createElement("button", {
	                        key: role.id,
	                        type: "button",
	                        role: "tab",
	                        className: "playground-team-role-card" + (selectedRoleDefinition.id === role.id ? " is-active" : ""),
	                        "aria-selected": selectedRoleDefinition.id === role.id ? "true" : "false",
	                        onClick: () => {
	                          if (typeof setProjectOverviewPermissionRoleId === "function") {
	                            setProjectOverviewPermissionRoleId(role.id);
	                          }
	                        },
	                      },
	                        React.createElement("span", { className: "playground-team-role-card-title" }, role.label),
	                        React.createElement("span", { className: "playground-team-role-card-description" }, role.description),
	                        React.createElement("span", { className: "playground-team-role-card-meta" }, "Project access")
	                      )
	                    )
	                  ),
	                  React.createElement("div", { className: "playground-team-role-permission-page playground-project-team-role-permission-page" + (isSelectedOwnerRole ? " is-read-only" : "") },
	                    React.createElement("div", { className: "playground-team-role-permission-header playground-project-team-role-permission-header" },
	                      React.createElement("div", null,
	                        React.createElement("div", { className: "playground-team-role-permission-kicker" }, "Project role"),
	                        React.createElement("h2", { className: "playground-team-role-permission-title" }, selectedRoleDefinition.label),
	                        React.createElement("p", { className: "playground-team-role-permission-copy" },
	                          "Project-scoped permissions for " + selectedRoleDefinition.label.toLowerCase() + "s in " + (selectedPermissionTeam.name || "this team") + "."
	                        )
	                      )
	                    ),
	                    renderPlaygroundPermissionPanel(selectedRolePermissionSet, {
	                      subjectType: "project_team_role",
	                      animationKey: projectPermissionChartAnimationKey,
	                      disabled: isSelectedOwnerRole || !hasRealAccess,
	                      onRingAccessChange: (ringId, nextAccess) => updateProjectTeamRolePermissionRingAccess?.(selectedPermissionTeam.id, selectedRoleDefinition.id, ringId, nextAccess),
	                      onActionRingChange: (actionId, nextRingId) => updateProjectTeamRolePermissionActionRing?.(selectedPermissionTeam.id, selectedRoleDefinition.id, actionId, nextRingId),
	                      onActionAccessChange: (actionId, nextAccess) => updateProjectTeamRolePermissionActionAccess?.(selectedPermissionTeam.id, selectedRoleDefinition.id, actionId, nextAccess),
	                    })
	                  )
	                );
	              return React.createElement("section", {
	                  className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-permissions-section playground-project-teams-section",
	                },
	                React.createElement("div", { className: "playground-project-team-permissions-header" },
	                  React.createElement("button", {
	                    type: "button",
	                    className: "playground-project-team-permissions-back",
	                    onClick: () => closeProjectOverviewPermissionDetail(),
	                  },
	                    React.createElement(ArrowLeft, { width: 13, height: 13, strokeWidth: 1.9 }),
	                    React.createElement("span", null, "Settings")
	                  ),
	                  React.createElement("div", { className: "playground-project-team-permissions-title" },
	                    isAllAgentsTeam
	                      ? (selectedPermissionTeam.name || "All Agents") + " Permissions"
	                      : (selectedPermissionTeam.name || "Team") + " Project Access"
	                  )
	                ),
	                isAllAgentsTeam
	                  ? renderPlaygroundPermissionPanel(projectPermissionSet, {
	                      subjectType: "project",
	                      animationKey: projectPermissionChartAnimationKey,
	                      onRingAccessChange: updateProjectPermissionRingAccess,
	                      onActionRingChange: updateProjectPermissionActionRing,
	                      onActionAccessChange: updateProjectPermissionActionAccess,
	                    })
	                  : renderProjectTeamRolePages()
	              );
	            }

	            return React.createElement("section", {
	                className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-teams-section playground-project-settings-root",
	              },
	              renderProjectOverviewWallpaperSettingsSection(),
	              renderProjectOverviewPluginsPanel(),
	              renderProjectOverviewSettingsRulesSection(),
	              renderProjectTeamTable()
	            );
	          }

            const projectOverviewActivePanel = activeProjectOverviewHomeTab === "resources"
                ? renderProjectOverviewResourcesPanel()
                : activeProjectOverviewHomeTab === "strategy"
                  ? renderProjectOverviewStrategyPanel()
                  : activeProjectOverviewHomeTab === "permissions"
                    ? renderProjectOverviewPermissionsPanel()
                    : renderProjectOverviewGeneralPanel();

	          return React.createElement("div", { className: "playground-tasks-view-section playground-project-overview-view is-" + activeProjectOverviewHomeTab },
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
	                          className: "playground-project-overview-sidebar-toggle",
	                          onClick: () => {
	                            projectOverviewSidebarAutoCollapsedForTaskRef.current = false;
	                            projectOverviewSidebarAutoCollapsedForPermissionRef.current = false;
	                            setProjectOverviewSidebarCollapsed((current) => !current);
	                          },
                          title: projectOverviewSidebarCollapsed ? "Show project sidebar" : "Hide project sidebar",
                          "aria-label": projectOverviewSidebarCollapsed ? "Show project sidebar" : "Hide project sidebar",
                          "aria-pressed": projectOverviewSidebarCollapsed ? "true" : "false",
                        },
                          React.createElement(PanelRight, {
                            width: 15,
                            height: 15,
                            strokeWidth: 1.8,
                          })
                        )
                      )
                    )
                  )
                )
              ),
              React.createElement("div", { className: "playground-project-overview-layout" + (projectOverviewSidebarCollapsed ? " is-sidebar-collapsed" : "") },
                React.createElement("div", { className: "playground-project-overview-main" },
                  renderProjectOverviewHomeTabs(),
                  projectOverviewActivePanel
                ),
                renderProjectOverviewSidebar()
              )
            )
          );
        }
`;
