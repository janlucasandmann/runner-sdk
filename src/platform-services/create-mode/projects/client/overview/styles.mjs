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
