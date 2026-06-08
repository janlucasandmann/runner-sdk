export const PROJECT_OVERVIEW_CSS = String.raw`
      .playground-project-overview-view {
        position: relative;
        isolation: isolate;
        width: min(100%, 56rem);
        margin: 0 auto;
        gap: 24px;
      }

      .playground-project-overview-view.is-general,
      .playground-project-overview-view.is-observability {
        width: 100%;
        max-width: none;
      }

      .playground-content-body.is-tasks-page .playground-environments-page:not(.playground-agents-page) .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-overview:has(.playground-project-overview-view.is-rules) {
        padding-bottom: 10px;
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
        background: rgb(122, 126, 255);
      }

      .playground-project-overview-progress-swatch.is-completed {
        background: rgb(56, 204, 164);
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
        grid-template-columns: 34px minmax(0, 1fr);
        gap: 14px;
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

      .playground-project-overview-activity-actor,
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
        font-weight: 600;
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
        min-height: 32px;
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

      .playground-project-overview-strategy-progress-card.playground-project-overview-chart-card {
        gap: 14px;
      }

      .playground-project-overview-outcome-preview-progress-track {
        height: 2px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-project-overview-outcome-preview-progress-fill {
        height: 100%;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0.94);
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

      .playground-project-overview-outcome-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-project-overview-outcome-preview {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-tasks-backlog-project-icon.is-outcome {
        color: #fff;
        background: linear-gradient(135deg, #d8b64f 0%, #b77c1e 52%, #6f4708 100%);
      }

      .playground-project-overview-outcome-preview .playground-tasks-backlog-item-content {
        width: 100%;
      }

      .playground-project-overview-outcome-preview .playground-tasks-backlog-main {
        margin-left: 2px;
      }

      .playground-project-overview-outcome-preview-progress {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .playground-project-overview-outcome-editor-modal {
        max-width: min(720px, calc(100vw - 32px));
      }

      .playground-project-overview-outcome-delete-button {
        margin-right: auto;
      }

      .playground-project-overview-outcome-editor-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
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

      .playground-project-overview-strategy-notes.playground-tasks-detail-description {
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
              "Project costs will appear here once agents, computers, or connected resources consume compute tokens."
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
          const activeProjectOverviewHomeTab = projectOverviewHomeTab === "observability" || projectOverviewHomeTab === "strategy" || projectOverviewHomeTab === "rules" || projectOverviewHomeTab === "plugins"
            ? projectOverviewHomeTab
            : "general";
          function renderProjectOverviewHomeTabs() {
            const tabs = [
	              { id: "general", label: "General" },
	              { id: "observability", label: "Observability" },
	              { id: "strategy", label: "Strategy" },
	              { id: "rules", label: "Rules" },
	              { id: "plugins", label: "Plugins" },
	            ];
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
                      if (typeof setProjectOverviewFilesSubview === "function") {
                        setProjectOverviewFilesSubview("overview");
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
          const projectOverviewFilesSubviewId = ["overview", "resources", "imagine"].includes(String(projectOverviewFilesSubview || ""))
            ? String(projectOverviewFilesSubview || "")
            : "overview";
          const isProjectOverviewResourceSubviewOpen = activeProjectOverviewHomeTab === "observability" && projectOverviewFilesSubviewId !== "overview";
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
              value: formatProjectOverviewCt(projectTotalCt) + " CT",
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

          function renderProjectOverviewResourcesPanel() {
            return React.createElement("div", { className: "playground-project-overview-resources-block" },
              React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Server Resources")
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
                  React.createElement("span", null, "Back to General")
                ),
                React.createElement("div", { className: "playground-project-overview-files-subview-title" }, title),
                description
                  ? React.createElement("div", { className: "playground-project-overview-files-subview-copy" }, description)
                  : null
              )
            );
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
              }),
              renderProjectOverviewFilesNavCard({
                id: "imagine",
                title: "Imagine Resources",
                copy: "Review images and visual assets created in this project.",
                Icon: Clapperboard,
              })
            );
          }

          function renderProjectOverviewFilesTab() {
            if (projectOverviewFilesSubviewId === "overview") {
              return null;
            }
            if (projectOverviewFilesSubviewId === "resources") {
              return React.createElement("section", { className: "playground-tasks-project-panel playground-project-overview-files-section" },
                renderProjectOverviewFilesSubviewHeader("Server Resources", "Track the deployable resources connected to this project."),
                renderProjectOverviewResourcesPanel()
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
            const assigneeLabel = typeof getTaskAssigneeName === "function"
              ? getTaskAssigneeName(task?.assigneeAgentId, "Unassigned")
              : "Unassigned";
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
                      ariaLabel: "Project compute token usage by resource type",
                      emptyText: "No project compute usage yet",
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

          function renderProjectOverviewThreadsSection() {
            return React.createElement("section", { className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section" },
              renderOverviewSectionHeader("Threads", null),
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

          function resolveProjectOverviewActivityActor(agentId, fallbackName) {
            const normalizedAgentId = String(agentId || "").trim();
            const fallback = String(fallbackName || "").trim();
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
            const actorName = String(resolvedAgent?.name || resolvedAgent?.label || fallback || "Agent").trim();
            let photoUrl = resolvedAgent && typeof getPlaygroundAgentProfilePhotoUrl === "function"
              ? getPlaygroundAgentProfilePhotoUrl(resolvedAgent)
              : "";
            if (!photoUrl) {
              const defaultPhotoUrls = {
                spark: "/img/agent-profile-pics/spark.webp",
                forge: "/img/agent-profile-pics/forge.webp",
                foundry: "/img/agent-profile-pics/foundry.webp",
              };
              photoUrl = defaultPhotoUrls[actorName.toLowerCase()] || "";
            }
            return {
              name: actorName || "Agent",
              photoUrl: photoUrl && typeof normalizeSessionPhotoUrl === "function" ? normalizeSessionPhotoUrl(photoUrl) : photoUrl,
            };
          }

          function buildProjectOverviewActivityItems() {
            const items = [];
            projectOverviewFilteredThreads.slice(0, 8).forEach((thread) => {
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
              const threadActivityActor = resolveProjectOverviewActivityActor(threadActor?.id, threadActor?.name || "Agent");
              const timestamp = Date.parse(String(safeThread?.updatedAt || safeThread?.createdAt || ""));
              items.push({
                id: "thread:" + String(safeThread?.id || displayThreadTitle || items.length),
                actorId: String(threadActor?.id || "").trim(),
                actor: threadActivityActor.name,
                photoUrl: threadActivityActor.photoUrl,
                task: threadTask,
                verb: "worked on",
                object: displayThreadTitle || "Untitled thread",
                taskId: threadTaskId,
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: typeof formatRelativeThreadTime === "function" ? (formatRelativeThreadTime(safeThread?.updatedAt || safeThread?.createdAt) || "") : "",
              });
            });
            (projectOverviewFileActivityState?.items || []).slice(0, 8).forEach((row, index) => {
              const assigneeId = String(row?.assigneeId || "").trim();
              const fileActivityActor = resolveProjectOverviewActivityActor(assigneeId, row?.assignee || "Agent");
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
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: String(row?.dateLabel || "").trim(),
              });
            });
            normalizedOverviewTasks.slice(0, 8).forEach((task) => {
              const assigneeId = String(task?.assigneeAgentId || "").trim();
              const timestamp = Date.parse(String(task?.updatedAt || task?.createdAt || ""));
              const actorName = typeof getTaskAssigneeName === "function"
                ? getTaskAssigneeName(assigneeId, "Agent")
                : "Agent";
              const taskActivityActor = resolveProjectOverviewActivityActor(assigneeId, actorName);
              items.push({
                id: "task:" + String(task?.id || task?.title || items.length),
                actorId: assigneeId,
                actor: taskActivityActor.name,
                photoUrl: taskActivityActor.photoUrl,
                task,
                verb: String(task?.createdAt || "") === String(task?.updatedAt || "") ? "created" : "updated",
                object: task?.title || "Untitled task",
                taskId: String(task?.id || "").trim(),
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: typeof formatRelativeThreadTime === "function" ? (formatRelativeThreadTime(task?.updatedAt || task?.createdAt) || "") : "",
              });
            });
            return items
              .filter((item) => item.object)
              .sort((left, right) => (right.time || 0) - (left.time || 0))
              .slice(0, 8);
          }

          function renderProjectOverviewActivityAvatar(item) {
            const className = "playground-project-overview-activity-avatar";
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

          function renderProjectOverviewActivitySection() {
            const activityItems = buildProjectOverviewActivityItems();
            return React.createElement("section", { className: "playground-project-overview-activity-card" },
              React.createElement("div", { className: "playground-project-overview-activity-header" },
                React.createElement("h2", { className: "playground-project-overview-activity-title" }, "Activity")
              ),
              activityItems.length > 0
                ? React.createElement("div", { className: "playground-project-overview-activity-list" },
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
                        )
                      )
                    )
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
                onClick: () => typeof setProjectOverviewHomeTab === "function" && setProjectOverviewHomeTab("observability"),
              }),
              React.createElement("div", { className: "playground-project-overview-cost-widget-main" },
                React.createElement("div", { className: "playground-project-overview-cost-widget-value" }, formatProjectOverviewCt(projectTotalCt) + " CT"),
                React.createElement("div", { className: "playground-project-overview-cost-widget-label" }, "Spent on project"),
                projectHasCostData
                  ? React.createElement("div", { className: "playground-project-overview-cost-widget-bars", "aria-label": "Project compute usage by resource type" },
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

          function isProjectOverviewMetronomeResource(resource) {
            const haystack = [
              resource?.type,
              resource?.kind,
              resource?.resourceType,
              resource?.title,
              resource?.name,
              resource?.label,
            ].join(" ").toLowerCase();
            return haystack.includes("metronome") || haystack.includes("schedule") || haystack.includes("cron");
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
                      setProjectOverviewHomeTab("observability");
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
                    setProjectOverviewHomeTab("observability");
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
                    setProjectOverviewHomeTab("observability");
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
                    setProjectOverviewHomeTab("observability");
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

          function renderProjectOverviewWidgetSection() {
            return React.createElement("div", { className: "playground-project-overview-widget-grid" },
              renderProjectOverviewProgressWidget(),
              renderProjectOverviewCostWidget(),
              renderProjectOverviewFilesWidget(),
              renderProjectOverviewResourcesWidget()
            );
          }

          function renderProjectOverviewGeneralPanel() {
            return React.createElement("div", { className: "playground-project-overview-general-grid" },
              renderProjectOverviewWidgetSection(),
              renderProjectOverviewActivitySection()
            );
          }

          function renderProjectOverviewStrategyPanel() {
            const strategyBrief = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft);
            const hasStrategyDocument = Boolean(String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim());

            function getOutcomeTasks(outcome) {
              const taskIds = new Set(normalizePlaygroundIdList(outcome?.taskIds));
              const releaseId = normalizePlaygroundStrategyText(outcome?.releaseId);
              if (!taskIds.size && !releaseId) {
                return [];
              }
              return normalizedOverviewTasks.filter((task) => {
                const taskId = String(task?.id || "").trim();
                return (taskId && taskIds.has(taskId))
                  || (releaseId && String(task?.releaseId || "").trim() === releaseId);
              });
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
                    taskIds: [],
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

            function toggleProjectOverviewOutcomeTask(taskId) {
              const normalizedTaskId = String(taskId || "").trim();
              if (!normalizedTaskId) return;
              const currentTaskIds = normalizePlaygroundIdList(projectOverviewOutcomeEditorState?.draft?.taskIds);
              const nextTaskIds = currentTaskIds.includes(normalizedTaskId)
                ? currentTaskIds.filter((id) => id !== normalizedTaskId)
                : currentTaskIds.concat(normalizedTaskId);
              updateProjectOverviewOutcomeEditorDraft({ taskIds: nextTaskIds });
            }

            function renderOutcomePreviewRow(outcome, index) {
              const progressInfo = getOutcomeProgressInfo(outcome);
              const outcomeNumber = String(index + 1).padStart(3, "0");
              const linkedLabel = progressInfo.tasks.length
                ? progressInfo.doneTasks.length + "/" + progressInfo.tasks.length + " tickets done"
                : "No tickets linked";
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
                    React.createElement("div", {
                      className: "playground-tasks-backlog-project-icon is-outcome",
                      "aria-hidden": "true",
                    }, React.createElement(Award, { width: 14, height: 14, strokeWidth: 1.9 })),
                    React.createElement("div", { className: "playground-tasks-backlog-main" },
                      React.createElement("span", { className: "playground-tasks-backlog-ticket" }, "Outcome " + outcomeNumber),
                      React.createElement("span", { className: "playground-tasks-backlog-title" }, outcome.title || "Untitled Outcome")
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-backlog-meta" },
                    React.createElement("span", { className: "playground-tasks-backlog-ticket" }, linkedLabel)
                  )
                ),
                React.createElement("div", { className: "playground-project-overview-outcome-preview-progress" },
                  React.createElement("div", { className: "playground-project-overview-outcome-preview-progress-track" },
                    React.createElement("div", {
                      className: "playground-project-overview-outcome-preview-progress-fill",
                      style: { width: String(progressInfo.progress) + "%" },
                    })
                  )
                )
              );
            }

            function renderProjectOverviewOutcomeEditorModal() {
              const index = Number(projectOverviewOutcomeEditorState?.index);
              const draft = getProjectOverviewOutcomeEditorDraft(index);
              if (!projectOverviewOutcomeEditorState || !Number.isInteger(index) || index < 0) {
                return null;
              }
              const selectedTaskIds = new Set(normalizePlaygroundIdList(draft.taskIds));
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
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Linked Tickets"),
                      React.createElement("div", { className: "playground-project-overview-outcome-ticket-list" },
                        normalizedOverviewTasks.length > 0
                          ? normalizedOverviewTasks.map((task) => {
                              const taskId = String(task?.id || "").trim();
                              const selected = taskId && selectedTaskIds.has(taskId);
                              const ticketNumber = taskTicketNumbersById[taskId] || task?.ticketNumber || "000";
                              return React.createElement("button", {
                                  key: taskId || ticketNumber,
                                  type: "button",
                                  className: "playground-project-overview-outcome-ticket-row" + (selected ? " is-selected" : ""),
                                  onClick: () => toggleProjectOverviewOutcomeTask(taskId),
                                },
                                React.createElement("span", { className: "playground-project-overview-outcome-ticket-check" },
                                  selected ? React.createElement(Check, { width: 11, height: 11, strokeWidth: 2.1 }) : null
                                ),
                                React.createElement("span", { className: "playground-project-overview-outcome-ticket-title" },
                                  ticketNumber + " " + (task?.title || "Untitled Task")
                                ),
                                React.createElement("span", { className: "playground-project-overview-outcome-ticket-status" },
                                  getPlaygroundTaskStatusLabel(getTaskBoardStatus(task))
                                )
                              );
                            })
                          : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No tickets in this project yet.")
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
            const mappedTicketIds = new Set();
            outcomeProgressItems.forEach((item) => {
              item.tasks.forEach((task) => {
                const taskId = String(task?.id || "").trim();
                if (taskId) mappedTicketIds.add(taskId);
              });
            });
            const averageOutcomeProgress = allOutcomesCount > 0
              ? Math.round(outcomeProgressItems.reduce((sum, item) => sum + Number(item.progress || 0), 0) / allOutcomesCount)
              : 0;
            const projectReadinessPercent = allOutcomesCount > 0
              ? Math.round((achievedOutcomesCount / allOutcomesCount) * 100)
              : 0;
            const strategyKpis = [
              { id: "all", value: String(allOutcomesCount), label: "All Outcomes" },
              { id: "open", value: String(notAchievedOutcomesCount), label: "Not Achieved Yet" },
              { id: "readiness", value: String(projectReadinessPercent) + "%", label: "Project Readiness" },
              { id: "mapped", value: String(mappedTicketIds.size), label: "Mapped Tickets" },
              { id: "average", value: String(averageOutcomeProgress) + "%", label: "Avg Outcome Progress" },
            ];

            return React.createElement("section", {
                className: "playground-project-overview-strategy-tab",
                ref: projectOverviewStrategySurfaceRef,
              },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-project-overview-strategy-scroll" },
                React.createElement("div", { className: "playground-project-overview-strategy-brief" },
                  React.createElement("div", { className: "playground-project-overview-strategy-goal" },
                    React.createElement("h2", { className: "playground-project-overview-strategy-card-title" }, "Project Goal"),
                    React.createElement("p", {
                      className: "playground-project-overview-strategy-goal-text" + (String(projectOverviewGoal || "").trim() ? "" : " is-empty"),
                    }, String(projectOverviewGoal || "").trim() || "No project goal set yet.")
                  ),
                  React.createElement("div", { className: "playground-project-overview-chart-card playground-project-overview-strategy-progress-card" },
                    React.createElement("div", { className: "playground-project-overview-summary-kpis playground-project-overview-chart-kpis" },
                      strategyKpis.map((item) =>
                        React.createElement("div", { key: item.id, className: "playground-project-overview-summary-kpi" },
                          React.createElement("div", { className: "playground-project-overview-summary-kpi-heading" },
                            React.createElement("div", { className: "playground-project-overview-summary-kpi-label" }, item.label)
                          ),
                          React.createElement("div", { className: "playground-project-overview-summary-kpi-value" }, item.value)
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-project-overview-strategy-add-row" },
                      React.createElement("h2", { className: "playground-project-overview-strategy-add-title" }, "Outcomes"),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-control-button playground-project-overview-add-outcome-button",
                        onClick: openProjectOverviewNewOutcomeEditor,
                      },
                        React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Add Outcome")
                      )
                    ),
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
                  ),
                  React.createElement("div", { className: "playground-project-overview-strategy-card is-notes" },
                    React.createElement("div", { className: "playground-tasks-detail-description playground-project-overview-strategy-notes" },
                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Full Strategy Notes"),
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
                              onClick: () => handleMissionControlDocumentFormat(action.id),
                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
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
                            setMissionControlDocumentDraft(event.target.value);
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

	          function renderProjectOverviewRulesPanel() {
	            const ruleEntries = splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules);
	            const canAddRule = Boolean(normalizePlaygroundProjectRuleEntry(projectRuleInputValue))
	              && !projectSaveState.isSaving;

	            return React.createElement("section", {
	                className: "playground-project-overview-rules-tab",
	                ref: projectOverviewRulesSurfaceRef,
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
	                            projectRuleEditingIndex === index
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
	                                  className: "playground-project-overview-rule-copy tb-runner-chat",
	                                  role: "button",
	                                  tabIndex: 0,
	                                  onClick: () => beginProjectRuleEntryEdit(index, entry),
	                                  onKeyDown: (event) => {
	                                    if (event.key === "Enter" || event.key === " ") {
	                                      event.preventDefault();
	                                      beginProjectRuleEntryEdit(index, entry);
	                                    }
	                                  },
	                                },
	                                  React.createElement(PlaygroundTaskDescriptionMarkdown, {
	                                    content: entry,
	                                    className: "tb-message-markdown",
	                                  })
	                                )
	                          ),
	                          React.createElement("div", { className: "playground-tasks-backlog-meta" },
	                            React.createElement("button", {
	                              type: "button",
	                              className: "playground-project-overview-rule-remove",
	                              onClick: () => void handleRemoveProjectRuleEntry(index),
	                              disabled: projectSaveState.isSaving,
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
	                projectSaveState.error
	                  ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, projectSaveState.error)
	                  : projectSaveState.isSaving
	                    ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Saving changes...")
	                    : null
	              ),
	              React.createElement("div", {
	                  className: "playground-project-overview-rules-composer-shell playground-tasks-backlog-composer-shell" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""),
	                },
	                React.createElement("div", { className: "tb-runner-chat playground-project-overview-rules-runner" },
	                  React.createElement("div", { className: "task-input-box" },
	                    React.createElement("div", { className: "tb-composer-textarea-shell" },
	                      React.createElement("textarea", {
	                        ref: projectRuleComposerTextareaRef,
	                        rows: 1,
	                        className: "sidebar-textarea",
	                        value: projectRuleInputValue,
	                        placeholder: "Add a project rule",
	                        onChange: (event) => {
	                          setProjectRuleInputValue(event.target.value);
	                          resizeTaskDescriptionTextarea(event.currentTarget);
	                        },
	                        onKeyDown: (event) => {
	                          if (event.key === "Enter" && !event.shiftKey) {
	                            event.preventDefault();
	                            void handleAddProjectRuleEntry();
	                          }
	                        },
	                      })
	                    ),
	                    React.createElement("div", { className: "task-input-controls task-input-controls-full" },
	                      React.createElement("div", { className: "task-input-spacer" }),
	                      React.createElement("button", {
	                        type: "button",
	                        className: "task-run-button task-run-button-full",
	                        onClick: () => void handleAddProjectRuleEntry(),
	                        disabled: !canAddRule,
	                        "aria-label": "Add rule",
	                        title: "Add rule",
	                      }, React.createElement(ArrowUp, { className: "task-send-icon", strokeWidth: 2.1 }))
	                    )
	                  )
	                )
	              )
	            );
	          }

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
                        )
                      )
                    )
                  )
                )
              ),
              renderProjectOverviewHomeTabs(),
              activeProjectOverviewHomeTab === "observability"
                ? renderProjectOverviewObservabilityPanel()
                : activeProjectOverviewHomeTab === "strategy"
                  ? renderProjectOverviewStrategyPanel()
                  : activeProjectOverviewHomeTab === "rules"
                    ? renderProjectOverviewRulesPanel()
                    : activeProjectOverviewHomeTab === "plugins"
                      ? renderProjectOverviewPluginsPanel()
                      : renderProjectOverviewGeneralPanel()
            )
          );
        }
`;
