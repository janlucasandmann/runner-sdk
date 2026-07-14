export const METRONOME_OVERVIEW_CSS = String.raw`
      .playground-metronome-page {
        width: 100%;
        height: 100%;
        min-height: 0;
        border-radius: inherit;
        background: #050505;
        color: rgba(255, 255, 255, 0.94);
        overflow: hidden;
      }

      .playground-metronome-page.is-overview {
        overflow-y: auto;
      }

      .playground-metronome-page.is-editor {
        overflow: hidden;
      }

      .playground-metronome-page.is-editor.is-code {
        padding: 42px 44px 12px;
      }

      .playground-metronome-overview {
        box-sizing: border-box;
        width: min(100%, calc(var(--playground-centered-page-max-width) + 88px));
        max-width: calc(var(--playground-centered-page-max-width) + 88px);
        margin: 0 auto;
        padding: 42px 44px 48px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .playground-metronome-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-metronome-kicker {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        margin-bottom: 9px;
      }

      .playground-metronome-title {
        margin: 0;
        font-size: 28px;
        line-height: 1.08;
        font-weight: 600;
        letter-spacing: 0;
      }

      .playground-metronome-copy {
        margin: 10px 0 0;
        max-width: 760px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 14px;
        line-height: 1.55;
      }

      .playground-metronome-primary-button,
      .playground-metronome-secondary-button,
      .playground-metronome-icon-button {
        position: relative;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.94);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        outline: none;
      }

      .playground-metronome-primary-button::before,
      .playground-metronome-secondary-button::before,
      .playground-metronome-icon-button::before,
      .playground-metronome-table::before,
      .playground-metronome-empty::before,
      .playground-metronome-code-button::before,
      .playground-metronome-palette-item-icon::before,
      .playground-metronome-node-icon::before {
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

      .playground-metronome-primary-button {
        min-height: 38px;
        padding: 0 16px;
        background: #fff;
        color: #050505;
      }

      .playground-metronome-secondary-button {
        min-height: 38px;
        padding: 0 16px;
      }

      .playground-metronome-icon-button {
        width: 38px;
        height: 38px;
        padding: 0;
      }

      .playground-metronome-kpis {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        border-radius: 16px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.045);
      }

      .playground-metronome-kpi {
        min-height: 102px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-kpi:last-child {
        border-right: 0;
      }

      .playground-metronome-kpi-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.52);
        font-weight: 500;
      }

      .playground-metronome-kpi-value {
        font-size: 25px;
        line-height: 1;
        font-weight: 600;
      }

      .playground-metronome-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-top: 6px;
      }

      .playground-metronome-section-title {
        font-size: 16px;
        font-weight: 600;
      }

      .playground-metronome-list-section {
        gap: 12px;
      }

      .playground-metronome-overview-table-section .playground-project-overview-threads-table-header,
      .playground-metronome-overview-table-section .playground-project-overview-threads-table-row {
        grid-template-columns: 21px minmax(300px, 1.35fr) minmax(96px, 0.36fr) minmax(170px, 0.7fr) minmax(150px, 0.55fr) minmax(118px, 0.42fr) 28px !important;
        gap: 12px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        padding-right: 0;
      }

      .playground-metronome-overview-table-section .playground-project-overview-threads-table-header *,
      .playground-metronome-overview-table-section .playground-project-overview-threads-table-row * {
        font-size: 12px;
      }

      .playground-metronome-overview-table-section .playground-project-overview-thread-cell,
      .playground-metronome-overview-table-section .playground-plugin-row-title,
      .playground-metronome-overview-table-section .playground-agents-overview-table-value,
      .playground-metronome-overview-table-section .playground-metronome-table-owner-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-overview-table-section .playground-project-overview-thread-cell.is-actions,
      .playground-metronome-overview-table-section .playground-project-overview-threads-table-header > div:last-child {
        justify-self: end;
      }

      .playground-metronome-overview-table-section .playground-project-overview-thread-cell.is-actions {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-metronome-overview-table-section .playground-metronome-table-owner {
        max-width: 100%;
        color: rgba(255, 255, 255, 0.74);
        font-size: 12px;
      }

      .playground-metronome-overview-table-section .playground-metronome-table-owner-avatar {
        width: 20px;
        height: 20px;
      }

      .playground-metronome-overview-table-section .playground-metronome-table-owner-avatar-fallback {
        font-size: 9px;
      }

      .playground-metronome-overview-status-label {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        min-height: 22px;
        padding: 0 8px;
        border: 0;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        white-space: nowrap;
        text-transform: none;
      }

      .playground-metronome-overview-status-label.is-active,
      .playground-metronome-overview-status-label.is-default {
        background: rgba(133, 223, 123, 0.1);
        color: #85DF7B;
      }

      .playground-metronome-overview-status-label.is-shared {
        background: rgba(77, 163, 255, 0.12);
        color: #4da3ff;
      }

      .playground-metronome-overview-status-label.is-removed {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-overview-table-icon {
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-metronome-overview-empty-row {
        min-height: 132px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 0;
        text-align: center;
      }

      .playground-metronome-overview-action-shell {
        position: relative;
      }

      .playground-metronome-overview-action-shell .playground-agents-overview-toolbar-menu {
        left: auto;
        right: 0;
        transform-origin: top right;
      }

      .playground-metronome-list-header {
        width: 100%;
        gap: 12px;
        margin: 0;
        padding: 0;
        z-index: 340;
      }

      .playground-metronome-list-header .playground-files-library-title-row {
        align-items: center;
      }

      .playground-metronome-list-title-actions {
        flex-shrink: 0;
      }

      .playground-metronome-list-search {
        width: min(240px, 34vw);
      }

      .playground-metronome-list-create-button {
        height: 30px;
      }

      .playground-metronome-list-toolbar {
        position: relative;
        z-index: 340;
        min-height: 30px;
        margin: 0;
        justify-content: space-between !important;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-list-tabs.content-mode-switch {
        height: 30px;
      }

      .playground-metronome-list-tabs .playground-files-library-tab {
        min-width: 0;
        padding-left: 16px;
        padding-right: 16px;
      }

      .playground-metronome-list-controls {
        position: relative;
        z-index: 341;
      }

      .playground-metronome-list-filter-shell.is-open {
        z-index: 10070;
      }

      .playground-metronome-list-filter-menu {
        right: 0;
        left: auto;
        top: calc(100% + 8px);
        min-width: 250px;
      }

      .playground-metronome-workflow-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 18px;
      }

      .playground-metronome-workflow-grid-card {
        --playground-home-widget-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        min-height: 220px;
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border-radius: 25px;
        background: #171717;
        box-shadow: 0 22px 52px rgba(0, 0, 0, 0.24);
        text-align: left;
      }

      .playground-metronome-workflow-grid-card::before {
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

      .playground-metronome-workflow-grid-card > * {
        position: relative;
        z-index: 1;
      }

      .playground-project-resources-grid-card.playground-metronome-workflow-grid-card {
        align-items: stretch;
        justify-content: flex-start;
        gap: 0;
        padding: 0;
        border-radius: 25px;
      }

      .playground-metronome-workflow-grid-card.is-removed-shared {
        cursor: default;
        opacity: 0.82;
      }

      .playground-metronome-workflow-card-hero {
        position: relative;
        width: 100%;
        height: 50px;
        flex: 0 0 50px;
        overflow: hidden;
        border-radius: 25px 25px 0 0;
        background:
          linear-gradient(180deg, rgba(9, 10, 12, 0.06), rgba(9, 10, 12, 0.32)),
          var(--metronome-workflow-wallpaper-image, none);
        background-size: cover, cover;
        background-position: center, center;
        background-repeat: no-repeat;
      }

      .playground-metronome-workflow-card-hero::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.2));
        pointer-events: none;
      }

      .playground-metronome-workflow-card-hero-top {
        position: relative;
        z-index: 2;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 10px 0 12px;
        background: rgba(9, 9, 10, 0.38);
      }

      .playground-metronome-workflow-card-hero-title {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 600;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .playground-metronome-workflow-card-hero .playground-metronome-table-menu-trigger {
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-metronome-workflow-card-hero .playground-metronome-table-menu-trigger:hover,
      .playground-metronome-workflow-card-hero .playground-metronome-table-menu-trigger:focus-visible,
      .playground-metronome-workflow-card-hero .playground-metronome-table-menu-trigger.is-open {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-workflow-card-preview {
        position: relative;
        width: 100%;
        align-self: stretch;
        box-sizing: border-box;
        height: 76px;
        flex: 0 0 auto;
        overflow: hidden;
        background: transparent;
      }

      .playground-metronome-workflow-grid-card > .playground-metronome-workflow-card-preview:first-child {
        height: 126px;
        flex-basis: 126px;
        overflow: hidden;
        border-radius: 25px 25px 0 0;
        background-image:
          linear-gradient(transparent, transparent),
          linear-gradient(180deg, rgba(9, 10, 12, 0.06), rgba(9, 10, 12, 0.32)),
          var(--metronome-workflow-wallpaper-image, none);
        background-position: 0 50px, center top, center top;
        background-size: 100% calc(100% - 50px), 100% 50px, cover;
        background-repeat: no-repeat;
      }

      .playground-metronome-workflow-grid-card > .playground-metronome-workflow-card-preview:first-child .playground-metronome-workflow-card-preview-svg {
        top: 50px;
        height: 76px;
      }

      .playground-metronome-workflow-grid-card > .playground-metronome-workflow-card-preview:first-child .playground-metronome-workflow-card-preview-node {
        transform: translate(-50%, calc(-50% + 24px));
      }

      .playground-metronome-workflow-card-preview-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .playground-metronome-workflow-card-preview-edge {
        fill: none;
        stroke: rgba(255, 255, 255, 0.24);
        stroke-width: 1;
        stroke-linecap: round;
      }

      .playground-metronome-workflow-card-preview-node {
        position: absolute;
        width: 18px;
        height: 18px;
        transform: translate(-50%, -50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent !important;
        box-shadow: none;
        z-index: 2;
      }

      .playground-metronome-workflow-card-preview-node svg {
        width: 14px;
        height: 14px;
        display: block;
        filter: var(--metronome-preview-icon-shadow, none);
      }

      .playground-metronome-workflow-card-preview-node.is-loop {
        color: #050505;
      }

      .playground-metronome-workflow-card-preview-empty {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.68);
        z-index: 2;
      }

      .playground-metronome-workflow-wallpaper-picker {
        margin: 0;
      }

      .playground-metronome-workflow-wallpaper-picker .playground-tasks-project-wallpaper-picker-preview {
        height: 188px;
        border-radius: 15px;
      }

      .playground-metronome-workflow-card-body {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0 12px 12px;
        background: #000000;
      }

      .playground-metronome-workflow-grid-card-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 8;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 9px;
        padding: 0 10px 0 12px;
        pointer-events: none;
        background: rgba(9, 9, 10, 0.38);
      }

      .playground-metronome-workflow-grid-card-title-copy {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-metronome-workflow-grid-card-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-workflow-grid-card-subtitle {
        display: none;
      }

      .playground-metronome-workflow-grid-card .playground-metronome-table-menu-shell {
        flex: 0 0 auto;
        z-index: 4;
        pointer-events: auto;
      }

      .playground-metronome-workflow-grid-meta {
        margin-top: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px 14px;
      }

      .playground-metronome-workflow-grid-meta-item {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-metronome-workflow-grid-meta-label {
        color: rgba(255, 255, 255, 0.42);
        font-size: 10px;
        line-height: 1.2;
      }

      .playground-metronome-workflow-grid-card-footer {
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
      }

      .playground-metronome-workflow-grid-card-footer .playground-metronome-table-owner-label {
        display: none;
      }

      .playground-metronome-workflow-grid-card-open {
        display: none;
        min-width: 30px;
        height: 30px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.9);
        color: #050505;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .playground-metronome-hero-heading {
        margin: 0;
        text-align: center;
        font-size: 24px;
        line-height: 1.2;
        font-weight: 500;
        letter-spacing: -0.02em;
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-metronome-hero-slide-content {
        width: min(100%, 650px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        text-align: center;
      }

      .playground-metronome-hero-pills {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 34px;
      }

      .playground-metronome-hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 34px;
        padding: 0 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.86);
        color: #111;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 14px 44px rgba(0, 0, 0, 0.16);
      }

      .playground-metronome-hero-pill.is-incoming {
        animation: playground-metronome-hero-pill-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .playground-metronome-hero-pill.is-outgoing {
        position: absolute;
        inset: 0 auto auto 50%;
        transform: translateX(-50%);
        animation: playground-metronome-hero-pill-out 260ms cubic-bezier(0.7, 0, 0.84, 0) both;
        pointer-events: none;
      }

      .playground-metronome-hero-pill-icon {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.08);
        color: #0d0d0d;
      }

      .playground-metronome-hero-copy {
        margin: 0;
        max-width: 560px;
        color: rgba(0, 0, 0, 0.7);
        font-size: 13px;
        line-height: 1.55;
      }

      .playground-metronome-hero-cta {
        position: absolute;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        min-height: 32px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: #0d0d0d;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
      }

      .playground-metronome-hero-dot {
        width: 8px;
        height: 8px;
        display: block;
        flex: 0 0 auto;
        padding: 0;
        border: 0;
        border-radius: 999px;
        appearance: none;
        background: rgba(255, 255, 255, 0.28);
        transition: background-color 160ms ease, transform 160ms ease;
        cursor: pointer;
      }

      .playground-metronome-hero-dot.is-active {
        background: rgba(255, 255, 255, 0.96);
        transform: scale(1.1);
      }

      @keyframes playground-metronome-hero-pill-in {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes playground-metronome-hero-pill-out {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-12px);
        }
      }

      .playground-metronome-table-shell {
        overflow: visible;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-metronome-table-action {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-metronome-workflow-table tr.is-built-in {
        cursor: pointer;
      }

      .playground-metronome-workflow-table tr.is-removed-shared {
        cursor: default;
      }

      .playground-metronome-workflow-table tr.is-removed-shared .playground-metronome-table-title {
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-table-menu-shell {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-metronome-table-menu-trigger {
        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.58);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: none;
      }

      .playground-metronome-table-menu-trigger:hover,
      .playground-metronome-table-menu-trigger:focus-visible,
      .playground-metronome-table-menu-trigger.is-open {
        color: rgba(255, 255, 255, 0.94);
        background: transparent;
        outline: none;
      }

      .playground-metronome-table-row-menu {
        top: calc(100% + 6px);
      }

      .playground-metronome-table-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-metronome-table-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 500;
      }

      .playground-metronome-table-subtitle {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.35;
      }

      .playground-metronome-table-owner {
        min-width: 0;
        max-width: 100%;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 11px;
        line-height: 1.35;
        white-space: nowrap;
      }

      .playground-metronome-table-owner-avatar {
        position: relative;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.76);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-table-owner-avatar.is-computer-agents {
        background: transparent;
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }

      .playground-metronome-table-owner-avatar.is-computer-agents::before {
        content: none;
        display: none;
      }

      .playground-metronome-table-owner-avatar-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playground-metronome-table-owner-avatar.is-computer-agents .playground-metronome-table-owner-avatar-image {
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        box-sizing: border-box;
        padding: 3px;
      }

      .playground-metronome-table-owner-avatar.is-computer-agents .playground-metronome-table-owner-avatar-fallback {
        display: none;
      }

      .playground-metronome-table-owner-avatar-fallback {
        font-size: 9px;
        line-height: 1;
        font-weight: 600;
      }

      .playground-metronome-table-owner-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-metronome-table-status {
        color: rgba(255, 255, 255, 0.82);
        font-size: 12px;
        text-transform: capitalize;
      }

      .playground-metronome-create-button {
        --playground-top-nav-private-chat-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        min-height: 30px;
        height: 30px;
        overflow: hidden;
        border: 0;
        border-radius: 999px;
        background: transparent;
        padding: 0 14px;
        color: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        cursor: pointer;
        transition: color 160ms ease, background 160ms ease;
      }

      .playground-metronome-create-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-top-nav-private-chat-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-metronome-create-button:hover,
      .playground-metronome-create-button:focus-visible {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.98);
        outline: none;
      }

      .playground-metronome-create-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-metronome-create-button svg {
        width: 14px;
        height: 14px;
      }

      .playground-metronome-publish-shell {
        position: relative;
        z-index: 40;
        display: inline-flex;
        align-items: center;
      }

      .playground-metronome-publish-button.is-active {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-detail-header-controls {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        min-width: 0;
        flex: 0 0 auto;
      }

      .playground-metronome-detail-header-publish-button.playground-agents-detail-publish-split-control {
        background: linear-gradient(to top, #082673, #1D59BE);
      }

      .playground-metronome-detail-header-publish-button.playground-agents-detail-publish-split-control:hover,
      .playground-metronome-detail-header-publish-button.playground-agents-detail-publish-split-control:focus-within,
      .playground-metronome-detail-header-publish-button.playground-agents-detail-publish-split-control.is-active {
        background: linear-gradient(to top, #082673, #1D59BE);
      }

      .playground-agents-detail-publish-split-control.is-disabled {
        opacity: 0.5;
      }

      .playground-metronome-detail-publish-split-shell .playground-metronome-detail-publish-menu {
        top: calc(100% + 8px);
        right: 0;
        left: auto;
        width: 268px;
        min-width: 268px;
        max-height: min(260px, calc(100vh - 160px));
        transform-origin: top right;
      }

      .playground-metronome-detail-version-selector-shell {
        position: relative;
        display: inline-flex;
        align-items: center;
        flex: 0 1 auto;
        width: max-content;
        max-width: min(320px, 42vw);
        min-width: 0;
      }

      .playground-metronome-detail-version-selector-shell .playground-metronome-detail-version-selector-menu {
        right: auto !important;
        left: 0 !important;
        width: 284px;
        min-width: 284px;
        max-height: min(340px, calc(100vh - 190px));
        overflow: hidden;
        transform-origin: top left;
      }

      .playground-metronome-detail-version-selector-main.playground-agents-detail-publish-main {
        min-width: 0;
        max-width: min(260px, 42vw);
      }

      .playground-metronome-detail-version-selector-list {
        max-height: min(278px, calc(100vh - 248px));
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      .playground-metronome-detail-version-selector-footer {
        margin-top: 4px;
        padding-top: 6px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-publish-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: min(460px, calc(100vw - 32px));
        max-height: min(620px, calc(100vh - 140px));
        overflow: auto;
        border-radius: 14px;
        background: rgba(20, 20, 20, 0.98);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.42);
        color: rgba(255, 255, 255, 0.92);
        padding: 12px;
      }

      .playground-metronome-publish-menu::before {
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

      .playground-metronome-publish-menu > * {
        position: relative;
        z-index: 6;
      }

      .playground-metronome-publish-menu-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        padding: 6px 6px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-publish-menu-title {
        font-size: 14px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-metronome-publish-menu-copy {
        margin-top: 5px;
        max-width: 270px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-metronome-publish-new-button {
        flex: 0 0 auto;
        min-height: 30px;
        padding: 0 12px;
        font-size: 12px;
        white-space: nowrap;
      }

      .playground-metronome-publish-state {
        margin: 10px 6px 0;
        border-radius: 10px;
        padding: 9px 10px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.7);
        font-size: 11px;
        line-height: 1.35;
      }

      .playground-metronome-publish-state.is-success {
        background: rgba(45, 212, 191, 0.1);
        color: rgba(153, 246, 228, 0.94);
      }

      .playground-metronome-publish-state.is-error {
        background: rgba(248, 113, 113, 0.12);
        color: rgba(254, 202, 202, 0.94);
      }

      .playground-metronome-publish-issues {
        margin: 0 0 14px;
        border-radius: 10px;
        padding: 10px 11px;
        background: rgba(248, 113, 113, 0.1);
        color: rgba(255, 255, 255, 0.78);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-metronome-publish-issues-title {
        margin-bottom: 7px;
        color: rgba(254, 202, 202, 0.96);
        font-size: 12px;
        font-weight: 500;
      }

      .playground-metronome-publish-issues-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .playground-metronome-publish-issues-item {
        display: flex;
        gap: 7px;
        align-items: flex-start;
      }

      .playground-metronome-publish-issues-dot {
        width: 4px;
        height: 4px;
        margin-top: 6px;
        border-radius: 999px;
        background: rgba(254, 202, 202, 0.78);
        flex: 0 0 auto;
      }

      .playground-metronome-publish-list {
        display: flex;
        flex-direction: column;
        padding-top: 8px;
      }

      .playground-metronome-publish-row,
      .playground-metronome-publish-empty {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 74px;
        padding: 11px 6px;
        border-bottom: 1px dotted rgba(255, 255, 255, 0.14);
      }

      .playground-metronome-publish-row:last-child,
      .playground-metronome-publish-empty:last-child {
        border-bottom: 0;
      }

      .playground-metronome-publish-empty-state {
        min-height: 214px;
        padding: 28px 18px 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .playground-metronome-publish-empty-card {
        width: min(100%, 300px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-publish-empty-image {
        width: 148px;
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 0 16px;
        object-fit: contain;
      }

      .playground-metronome-publish-empty-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-metronome-publish-empty-copy {
        margin: 7px 0 0;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-publish-loading-state {
        min-height: 96px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-metronome-publish-loading-icon {
        width: 18px;
        height: 18px;
      }

      .playground-metronome-publish-row.is-active {
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-metronome-publish-row.is-selected {
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-metronome-publish-row-checkbox {
        position: relative;
        flex: 0 0 auto;
        width: 20px;
        height: 20px;
        border: 1px dashed rgba(255, 255, 255, 0.15);
        border-radius: 7px;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
      }

      .playground-metronome-publish-row-checkbox::before {
        display: none;
      }

      .playground-metronome-publish-row-checkbox > * {
        position: relative;
        z-index: 2;
      }

      .playground-metronome-publish-row-checkbox.is-selected {
        border-color: #4da3ff;
        background: #4da3ff;
        color: #fff;
      }

      .playground-metronome-publish-row-checkbox.is-selected svg {
        width: 14px;
        height: 14px;
        stroke-width: 2.4;
      }

      .playground-metronome-publish-row-checkbox:disabled,
      .playground-metronome-publish-row-action:disabled {
        cursor: default;
        opacity: 0.6;
      }

      .playground-metronome-publish-row-checkbox.is-selected:disabled {
        opacity: 1;
      }

      .playground-metronome-publish-row-main {
        min-width: 0;
        flex: 1 1 auto;
        border: 0;
        padding: 0;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }

      .playground-metronome-publish-row-title {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 500;
      }

      .playground-metronome-publish-row-copy {
        margin-top: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.35;
      }

      .playground-metronome-publish-row-description {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 11px;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      .playground-metronome-publish-row-meta {
        margin-top: 4px;
      }

      .playground-metronome-publish-active-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border-radius: 999px;
        padding: 3px 7px;
        background: rgba(45, 212, 191, 0.1);
        color: rgba(153, 246, 228, 0.94);
        font-size: 10px;
        line-height: 1;
        font-weight: 500;
      }

      .playground-metronome-publish-row-action {
        min-height: 28px;
        border-radius: 999px;
        padding: 0 10px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        white-space: nowrap;
      }

      .playground-metronome-publish-row-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
      }

      .playground-metronome-publish-row-menu-shell {
        position: relative;
        display: inline-flex;
        flex: 0 0 auto;
      }

      .playground-metronome-publish-row-menu-trigger {
        border: 0;
        border-radius: 999px;
        width: 28px;
        height: 28px;
        padding: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        outline: none;
      }

      .playground-metronome-publish-row-menu-trigger:hover,
      .playground-metronome-publish-row-menu-trigger.is-open {
        color: rgba(255, 255, 255, 0.92);
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-metronome-publish-row-menu-trigger::before {
        display: none;
      }

      .playground-metronome-publish-row-menu {
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        z-index: 80;
        min-width: 188px;
        overflow: hidden;
        border-radius: 15px;
        color: #fff;
        transform-origin: top right;
      }

      .playground-metronome-publish-row-menu-item {
        width: 100%;
        min-height: 42px;
        border: 0;
        border-radius: 0;
        padding: 12px 16px;
        background: transparent;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        line-height: 1;
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-metronome-publish-row-menu-item:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .playground-metronome-publish-row-menu-item.is-danger {
        color: rgba(255, 160, 160, 0.95);
      }

      .playground-metronome-publish-row-menu-item.is-danger:hover {
        background: rgba(248, 113, 113, 0.12);
        color: rgba(255, 205, 205, 0.98);
      }

      .playground-metronome-publish-title-actions {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        flex: 0 0 auto;
      }

      .playground-metronome-publish-settings-trigger {
        width: 28px;
        height: 28px;
      }

      .playground-metronome-publish-settings-menu {
        top: calc(100% + 7px);
        right: 0;
      }

      .playground-metronome-publish-sidebar .playground-metronome-inspector-body {
        flex: 1 1 0;
        gap: 0;
        padding-bottom: 14px;
      }

      .playground-metronome-publish-sidebar-summary {
        position: relative;
        border-radius: 14px;
        padding: 14px;
        margin-bottom: 14px;
        background: rgba(255, 255, 255, 0.04);
      }

      .playground-metronome-publish-sidebar-summary::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 1;
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

      .playground-metronome-publish-sidebar-summary > * {
        position: relative;
        z-index: 2;
      }

      .playground-metronome-publish-sidebar-section-title {
        margin: 0 0 8px;
        padding-top: 24px;
        padding-bottom: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: rgba(255, 255, 255, 0.94);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.35;
      }

      .playground-metronome-publish-sidebar-section-title-text {
        min-width: 0;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-menu-copy {
        max-width: none;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-new-button {
        width: 100%;
        justify-content: center;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-version-button {
        flex: 0 0 auto;
        width: auto;
        min-height: 28px;
        padding: 0 11px;
        gap: 6px;
        font-size: 11px;
      }

      .playground-metronome-version-changes-shell {
        min-width: 0;
        min-height: 0;
        height: 100%;
        overflow: auto;
        padding: 24px 44px 48px;
        box-sizing: border-box;
      }

      .playground-metronome-version-changes-shell .playground-version-changes-page {
        width: min(100%, 1080px);
        margin: 0 auto;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-state {
        margin: 0 0 12px;
      }

      .playground-metronome-publish-sidebar-header-menu-shell.playground-tasks-toolbar-popup-shell {
        z-index: 91;
        display: inline-flex;
        align-items: center;
      }

      .playground-metronome-publish-sidebar-header-menu {
        top: calc(100% + 8px);
        right: 0;
        left: auto;
        width: 268px;
        min-width: 268px;
        max-height: min(260px, calc(100vh - 160px));
        transform-origin: top right;
      }

      .playground-metronome-publish-sidebar-header-menu .tb-popup-row {
        padding: 10px 14px;
      }

      .playground-metronome-publish-sidebar-header-menu .playground-metronome-publish-sidebar-header-menu-shortcut {
        margin-left: auto;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.42);
        font-size: 10px;
        font-weight: 400;
        line-height: 1;
        letter-spacing: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .playground-metronome-publish-sidebar-header-menu .tb-popup-row:disabled {
        cursor: not-allowed;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-metronome-publish-sidebar-header-menu .tb-popup-row:disabled:hover {
        background: transparent;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-list-container {
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 0;
        background: transparent;
        border: 0;
        padding: 12px;
        border-radius: 10px;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(50px);
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-list-container::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.15),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.07),
          rgba(255, 255, 255, 0.3)
        );
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-list-container > * {
        position: relative;
        z-index: 1;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-list {
        padding-top: 0;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-row,
      .playground-metronome-publish-sidebar .playground-metronome-publish-empty {
        min-height: 58px;
        padding: 8px 0;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-row:first-child,
      .playground-metronome-publish-sidebar .playground-metronome-publish-empty:first-child {
        padding-top: 0;
      }

      .playground-metronome-publish-sidebar .playground-metronome-publish-row:last-child,
      .playground-metronome-publish-sidebar .playground-metronome-publish-empty:last-child {
        padding-bottom: 0;
      }

      .playground-metronome-deployment-history-title-line {
        margin-top: 22px;
      }

      .playground-metronome-deployment-history-list {
        display: flex;
        flex-direction: column;
      }

      .playground-metronome-deployment-history-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 0;
        border-bottom: 1px dotted rgba(255, 255, 255, 0.12);
      }

      .playground-metronome-deployment-history-row:last-child {
        border-bottom: 0;
      }

      .playground-metronome-deployment-history-icon {
        width: 24px;
        height: 24px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.92);
        background: rgba(77, 163, 255, 0.16);
      }

      .playground-metronome-deployment-history-icon.is-unpublish {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-metronome-deployment-history-main {
        min-width: 0;
        flex: 1 1 auto;
      }

      .playground-metronome-deployment-history-title {
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 500;
      }

      .playground-metronome-deployment-history-meta,
      .playground-metronome-deployment-history-empty {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-metronome-deployment-history-empty {
        margin-top: 0;
        padding: 10px 0 4px;
      }

      .playground-metronome-deployment-history-empty.is-error {
        color: rgba(255, 160, 160, 0.88);
      }

      .playground-metronome-deployment-history-modal .playground-metronome-deployment-history-list {
        max-height: min(58vh, 460px);
        overflow-y: auto;
        padding-right: 2px;
      }

      .playground-metronome-deployment-history-modal .playground-metronome-deployment-history-empty {
        padding: 16px 0 2px;
      }

      .playground-metronome-publish-sidebar-actions {
        flex: 0 0 auto;
        padding: 12px 10px 15px 15px;
        display: flex;
        flex-direction: row;
        gap: 12px;
      }

      .playground-metronome-publish-sidebar-actions > .playground-metronome-publish-new-button {
        flex: 1 1 0;
        width: auto;
        min-width: 0;
        font-weight: 500;
      }

      .playground-metronome-workflow-table th,
      .playground-metronome-workflow-table td,
      .playground-metronome-runs-table th,
      .playground-metronome-runs-table td {
        padding-left: 0;
        padding-right: 0;
      }

      .playground-metronome-workflow-table .playground-metronome-workflow-col-main {
        width: 34%;
      }

      .playground-metronome-workflow-table .playground-metronome-workflow-col-status {
        width: 11%;
      }

      .playground-metronome-workflow-table .playground-metronome-workflow-col-trigger {
        width: 19%;
      }

      .playground-metronome-workflow-table .playground-metronome-workflow-col-owner {
        width: 15%;
      }

      .playground-metronome-workflow-table .playground-metronome-workflow-col-updated {
        width: 15%;
      }

      .playground-metronome-workflow-table .playground-metronome-workflow-col-actions {
        width: 52px;
      }

      .playground-metronome-table,
      .playground-metronome-empty {
        position: relative;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.025);
        overflow: hidden;
      }

      .playground-metronome-table-row {
        display: grid;
        grid-template-columns: minmax(280px, 1.6fr) minmax(160px, 0.7fr) minmax(180px, 0.8fr) minmax(140px, 0.6fr) 40px;
        align-items: center;
        gap: 18px;
        padding: 18px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        color: inherit;
        background: transparent;
        width: 100%;
        text-align: left;
        font: inherit;
      }

      .playground-metronome-table-row:first-child {
        border-top: 0;
      }

      .playground-metronome-table-row.is-head {
        min-height: 52px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        font-weight: 600;
        cursor: default;
      }

      button.playground-metronome-table-row {
        cursor: pointer;
      }

      button.playground-metronome-table-row:hover {
        background: rgba(255, 255, 255, 0.035);
      }

      .playground-metronome-name-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .playground-metronome-name-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 166, 255, 0.12);
        color: #66a6ff;
        flex: 0 0 auto;
      }

      .playground-metronome-name-title {
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-name-subtitle {
        margin-top: 4px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.48);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-chip {
        width: fit-content;
        border-radius: 999px;
        padding: 6px 10px;
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.08);
        font-size: 12px;
        font-weight: 600;
      }

      .playground-metronome-chip.is-active {
        background: rgba(45, 212, 191, 0.12);
        color: rgba(153, 246, 228, 0.94);
      }

      .playground-metronome-empty {
        min-height: 340px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 42px;
      }

      .playground-metronome-empty-inner {
        max-width: 430px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      .playground-metronome-empty-icon {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 166, 255, 0.1);
        color: #66a6ff;
      }

      .playground-metronome-empty-title {
        font-size: 20px;
        font-weight: 600;
      }

      .playground-metronome-empty-copy {
        color: rgba(255, 255, 255, 0.56);
        font-size: 13px;
        line-height: 1.5;
      }
`;
