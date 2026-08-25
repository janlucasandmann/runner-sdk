export const PROJECT_OVERVIEW_CSS_01_FRAGMENT = String.raw`
      .playground-project-overview-view {
        position: relative;
        isolation: isolate;
        width: min(100%, 56rem);
        margin: 0 auto;
        gap: 24px;
      }

      .playground-project-overview-view.is-general,
      .playground-project-overview-view.is-milestones,
      .playground-project-overview-view.is-permissions {
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
        gap: var(--resource-detail-section-gap, 20px);
      }

      .playground-project-overview-sidebar {
        min-width: 0;
        position: sticky;
        top: var(--project-detail-sticky-offset, 0px);
        max-height: calc(100vh - var(--project-detail-sticky-offset, 0px) - 20px);
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: none;
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

      .playground-project-overview-sidebar::-webkit-scrollbar {
        display: none;
      }

      .playground-project-overview-layout.is-sidebar-collapsed .playground-project-overview-sidebar {
        opacity: 0;
        transform: translateX(18px);
        visibility: hidden;
        pointer-events: none;
        transition-delay: 0s, 0s, 180ms;
      }

      .playground-project-overview-sidebar-card {
        overflow: visible;
      }

      .playground-project-overview-milestones-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-project-overview-milestones-card__header {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-milestones-card__title,
      .playground-project-overview-milestones-card__add,
      .playground-project-overview-milestones-card__open {
        appearance: none;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .playground-project-overview-milestones-card__title {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        color: #fff;
        font-size: 12px;
        line-height: 1.3;
        font-weight: 400;
      }

      .playground-project-overview-milestones-card__title:hover {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-project-overview-milestones-card__add {
        display: inline-grid;
        place-items: center;
        flex: 0 0 auto;
        width: 26px;
        height: 26px;
        padding: 0;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-project-overview-milestones-card__add:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-project-overview-milestones-card__list {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-project-overview-milestones-card__row {
        min-width: 0;
        display: block;
      }

      .playground-project-overview-milestones-card__open {
        min-width: 0;
        width: 100%;
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 6px 0;
        text-align: left;
      }

      .playground-project-overview-milestones-card__progress {
        box-sizing: border-box;
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        border-radius: 50%;
        background:
          radial-gradient(circle at center, #131313 52%, transparent 54%),
          conic-gradient(
            #636bdc 0 var(--project-milestone-progress, 0%),
            rgba(255, 255, 255, 0.12) var(--project-milestone-progress, 0%) 100%
          );
      }

      .playground-project-overview-milestones-card__name {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-overview-milestones-card__meta {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        white-space: nowrap;
      }

      .playground-project-overview-milestones-card__empty {
        padding: 6px 0;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.4;
        font-weight: 400;
      }

      .playground-project-overview-sidebar-facts {
        position: relative;
        min-width: 0;
        margin: 0;
        padding: 0;
        overflow: visible;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      .playground-project-overview-sidebar-facts::before {
        content: none;
        display: none;
      }

      .playground-project-overview-sidebar-title {
        color: #fff;
        font-size: 12px;
        font-weight: 400;
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
        min-height: 30px;
        display: grid;
        grid-template-columns: minmax(88px, 110px) minmax(0, 1fr);
        gap: 12px;
        align-items: center;
        padding: 0;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-project-overview-sidebar-row.is-owner {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-sidebar-row-label {
        min-width: 0;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        color: #fff;
      }

      .playground-project-overview-sidebar-row-value {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 7px;
        font-size: 12px;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.88);
        text-align: right;
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

      .playground-project-overview-sidebar-selector {
        width: 100%;
      }

      .playground-project-overview-sidebar-selector-trigger {
        width: 100%;
        max-width: 100%;
        justify-content: flex-end;
        text-align: right;
      }

      .playground-project-overview-sidebar-selector-trigger.is-empty {
        color: rgba(255, 255, 255, 0.46);
      }

      .playground-project-overview-sidebar-selector-popup {
        width: min(280px, calc(100vw - 48px));
      }

      .playground-project-overview-sidebar-mission-button {
        width: 100%;
        margin-top: 8px;
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

      .playground-project-overview-sidebar-selector-popup .playground-tasks-priority-value,
      .playground-project-overview-sidebar-selector-trigger .playground-tasks-priority-value {
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

      .playground-project-overview-status-icon.is-on-track {
        color: #85df7b;
      }

      .playground-project-overview-status-icon.is-at-risk {
        color: #ffb84d;
      }

      .playground-project-overview-status-value {
        max-width: 100%;
      }

      .playground-project-overview-status-value .playground-tasks-status-value-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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

      .playground-project-overview-description-editor {
        width: 100%;
        min-width: 0;
        margin: 0;
      }

      .playground-project-overview-description-editor.is-minimalistic-ui.is-sticky
        .platform-instructions-editor__header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #000;
      }

      .playground-project-overview-description-editor
        .platform-instructions-editor__title {
        flex: 1 1 auto;
        overflow: hidden;
        font-size: 14px;
        font-weight: 400;
      }

      .playground-project-overview-description-editor
        .platform-instructions-editor__title
        .playground-project-overview-activity-tabs {
        width: auto;
        max-width: 100%;
      }

      .playground-project-overview-description-editor
        .platform-instructions-editor__title
        .platform-detail-tab-bar__list {
        flex: 0 1 auto;
      }

      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-overview {
        padding-top: 0 !important;
      }

      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-overview
        .playground-project-detail-overview-layout {
        --project-detail-sticky-offset: 42px;
        padding-top: var(--project-detail-sticky-offset);
      }

      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-overview .playground-project-overview-summary-title {
        margin-top: 42px;
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
        font-weight: 400;
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
        gap: 42px;
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

`;
