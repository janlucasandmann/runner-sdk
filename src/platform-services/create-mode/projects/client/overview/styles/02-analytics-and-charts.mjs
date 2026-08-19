export const PROJECT_OVERVIEW_CSS_02_FRAGMENT = String.raw`        .playground-project-overview-progress-combo-ranges {
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
          max-height: none;
          overflow: visible;
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

      .playground-project-overview-general-grid > .playground-project-overview-activity-card.is-main {
        margin-bottom: 42px;
      }

      .playground-project-overview-activity-card.is-main .playground-project-overview-activity-title {
        font-size: 14px;
        line-height: 1.35;
      }

      .playground-project-overview-activity-card.is-main .playground-project-overview-activity-list {
        gap: 12px;
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
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        box-sizing: border-box;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid #050505;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-activity-participant-avatar + .playground-project-overview-activity-participant-avatar {
        margin-left: -5px;
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

      .playground-project-overview-activity-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-project-overview-activity-tabs {
        width: 100%;
      }

      .playground-project-overview-threads-tabs-toolbar {
        flex-wrap: nowrap;
        align-items: center;
      }

      .playground-project-overview-threads-tabs-toolbar .platform-data-table__toolbar-leading {
        flex: 0 1 auto;
        overflow: hidden;
      }

      .playground-project-overview-threads-tabs-toolbar .playground-project-overview-activity-tabs {
        width: auto;
        max-width: 100%;
      }

      .playground-project-overview-threads-tabs-toolbar .platform-detail-tab-bar__list {
        flex: 0 1 auto;
      }

      .playground-project-overview-task-activity-timeline .platform-activity-timeline__header {
        display: none;
      }

      .playground-project-overview-task-activity-ticket {
        display: block;
        max-width: min(32vw, 280px);
        overflow: hidden;
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        line-height: 1.4;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-overview-task-activity-loading {
        min-height: 124px;
        display: flex;
        align-items: center;
        justify-content: center;
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
        border-top: 0;
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
`;
