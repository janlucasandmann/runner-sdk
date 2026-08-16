export const PROJECTS_CORE_CSS_02_FRAGMENT = `      .playground-projects-overview-surface.is-empty-hero .playground-projects-overview-title-block {
        padding-bottom: 0;
        border-bottom: 0;
      }

      .playground-projects-overview-title-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-projects-overview-title-block .playground-project-overview-summary-title {
        font-size: 18px;
        line-height: 1.2;
      }

      .playground-projects-overview-title-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }

      .playground-projects-overview-add-button {
        white-space: nowrap;
        box-sizing: border-box;
      }

      .playground-projects-overview-add-button svg {
        width: 14px;
        height: 14px;
      }

      @media (max-width: 1100px) {
        .playground-projects-list-header,
        .playground-projects-list-row {
          grid-template-columns: minmax(280px, 1fr) 160px 90px 90px 90px;
        }

        .playground-projects-list-col-target,
        .playground-projects-list-col-issues,
        .playground-projects-list-target,
        .playground-projects-list-issues {
          display: none;
        }
      }

      .playground-projects-working-agent-section {
        width: 100%;
        color: #fff;
      }

      .playground-projects-working-agent-card {
        position: relative;
        width: 100%;
        height: 710px;
        overflow: hidden;
        border-radius: 20px;
        background: #000;
      }

      .playground-projects-working-agent-card::after {
        content: "";
        position: absolute;
        z-index: 8;
        inset: 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: inherit;
        pointer-events: none;
      }

      .playground-projects-working-agent-image {
        display: block;
        width: 100%;
        height: 710px;
        margin-bottom: -50px;
        object-fit: cover;
        object-position: center top;
        border-radius: 20px;
      }

      .playground-projects-working-agent-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 64px 24px 32px;
      }

      .playground-projects-working-agent-title {
        margin: 0;
        text-align: center;
        color: #fff;
        font-size: 48px;
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-projects-working-agent-title-emphasis {
        font-family: Georgia, serif;
        font-style: italic;
      }

      .playground-projects-working-agent-copy {
        max-width: 680px;
        margin: 16px auto 0;
        padding: 0 4px;
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        line-height: 1.55;
        font-weight: 400;
      }

      .playground-projects-working-agent-features {
        margin-top: 36px;
        margin-bottom: 24px;
      }

      .playground-projects-feature-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 0.82fr);
        gap: 48px;
        align-items: flex-start;
      }

      .playground-projects-feature-column {
        min-width: 0;
      }

      .playground-projects-feature-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-projects-feature-row {
        width: 100%;
        min-height: 58px;
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr);
        align-items: center;
        gap: 14px;
        color: rgba(255, 255, 255, 0.9);
        cursor: default;
      }

      .playground-projects-feature-icon {
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-projects-feature-icon svg {
        width: 18px;
        height: 18px;
      }

      .playground-projects-feature-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-projects-feature-title,
      .playground-projects-feature-subtitle {
        white-space: normal;
      }

      .playground-projects-feature-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.3;
      }

      .playground-projects-feature-subtitle {
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.45;
      }

      .playground-projects-working-agent-logos {
        position: relative;
        width: min(100%, 1100px);
        height: 76px;
        margin: 36px auto 0;
      }

      .playground-projects-logo-carousel-line {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        width: 2px;
        height: 120px;
        border-radius: 999px;
        transform: translate(-50%, -50%);
        background: linear-gradient(to bottom, transparent 0%, #3b82f6 20%, #3b82f6 80%, transparent 100%);
        box-shadow: 0 0 5px #3b82f6;
        pointer-events: none;
        transition: width 200ms ease, box-shadow 200ms ease;
      }

      .playground-projects-logo-carousel-line.is-pulsing {
        width: 3px;
        box-shadow: 0 0 8px #3b82f6;
      }

      .playground-projects-logo-carousel-center {
        position: absolute;
        z-index: 4;
        top: 50%;
        left: 50%;
        width: 64px;
        height: 64px;
        transform: translate(-50%, -50%);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 0 40px rgba(255, 255, 255, 0.2), 0 0 80px rgba(255, 255, 255, 0.1);
        transition: transform 200ms ease;
      }

      .playground-projects-logo-carousel-center.is-pulsing {
        transform: translate(-50%, -50%) scale(1.1);
      }

      .playground-projects-logo-carousel-center::before {
        content: "";
        position: absolute;
        inset: -45px;
        border-radius: 28px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 48%, transparent 70%);
        filter: blur(8px);
        z-index: -1;
      }

      .playground-projects-logo-carousel-center img,
      .playground-projects-logo-carousel-item img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .playground-projects-logo-carousel-mask {
        width: 100%;
        height: 76px;
        overflow: hidden;
        display: flex;
        align-items: center;
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
        mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
      }

      .playground-projects-logo-carousel-track {
        display: flex;
        align-items: center;
        gap: 44px;
        animation: playground-projects-logo-carousel-scroll 40s linear infinite;
        will-change: transform;
      }

      .playground-projects-logo-carousel-item {
        flex: 0 0 52px;
        width: 52px;
        height: 52px;
        border-radius: 12px;
        overflow: hidden;
      }

      @keyframes playground-projects-logo-carousel-scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-1152px);
        }
      }

      @media (max-width: 980px) {
        .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface.is-empty-hero {
          padding: 24px 18px 36px;
        }
      }

      @media (max-width: 767px) {
        .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface {
          padding: 0;
        }

        .playground-content-body.is-tasks-page .playground-tasks-main-scroll.is-projects-home > .playground-projects-overview-surface.is-empty-hero {
          width: 100%;
          max-width: none;
          padding: 24px 18px 36px;
        }

        .playground-projects-working-agent-card {
          min-height: 420px;
        }

        .playground-projects-working-agent-image {
          position: absolute;
          top: 208px;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: calc(100% - 208px);
          object-fit: cover;
          object-position: bottom;
        }

        .playground-projects-working-agent-card::before {
          content: "";
          position: absolute;
          z-index: 1;
          top: 208px;
          left: 0;
          right: 0;
          height: 128px;
          border-radius: 20px 20px 0 0;
          background: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0) 100%);
        }

        .playground-projects-working-agent-overlay {
          z-index: 2;
          padding: 16px 16px 48px;
        }

        .playground-projects-working-agent-title {
          font-size: 24px;
          line-height: 1.12;
        }

        .playground-projects-working-agent-copy {
          max-width: 520px;
          margin-top: 12px;
        }

        .playground-projects-working-agent-logos {
          margin-top: 14px;
        }

        .playground-projects-feature-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 28px;
        }
      }

      .playground-tasks-detail-scroll {
        padding: 9px 18px 28px;
        gap: 12px;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .playground-tasks-detail-scroll::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

      .playground-tasks-detail-navbar {
        position: relative;
        z-index: 40;
        flex-shrink: 0;
        border-bottom: 0;
      }

      .playground-tasks-detail-navbar-title {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-tasks-detail-navbar-title-meta {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .playground-tasks-detail-navbar-title-main {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
      }

      .playground-tasks-detail-navbar-title-editable {
        gap: 8px;
      }

      .playground-tasks-detail-navbar-title-hint {
        flex: 0 0 auto;
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.42);
        pointer-events: none;
      }

      .playground-tasks-detail-navbar-title .playground-content-title {
        min-width: 0;
      }

      .playground-tasks-detail-navbar-title-input {
        display: block;
        width: 100%;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
        outline: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.2;
        box-sizing: border-box;
      }

      .playground-tasks-detail-navbar-title-input::placeholder {
        color: rgba(255, 255, 255, 0.38);
      }

      .playground-tasks-detail-navbar-title-input[readonly] {
        cursor: default;
        opacity: 0.88;
      }

      .playground-tasks-detail-navbar-ticket {
        flex: 0 0 auto;
        color: #66a6ff;
        font-size: 13px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-tasks-detail-navbar-status {
        flex: 0 0 auto;
      }

      .playground-tasks-backlog-status.playground-tasks-detail-navbar-status {
        border-radius: 999px;
      }

      .playground-tasks-detail-navbar-actions {
        position: relative;
        z-index: 41;
        gap: 4px;
      }

      .playground-tasks-detail-thread-link-row {
        padding: 0 0 10px;
      }

      .playground-tasks-detail-thread-card {
        width: 100%;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-tasks-detail-thread-card-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-tasks-detail-thread-card-title {
        min-width: 0;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-tasks-detail-thread-card-description {
        min-width: 0;
        font-size: 11px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-tasks-detail-thread-card-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-tasks-detail-thread-card-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 28px;
        padding: 0 12px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.88);
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
        overflow: hidden;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-tasks-detail-thread-card-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: 999px;
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

      .playground-tasks-detail-thread-card-button:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }

      .playground-tasks-detail-threads-section.playground-plugins-section {
        gap: 0px;
        margin-bottom: 0;
      }

      .playground-tasks-detail-threads-section + .playground-tasks-detail-description {
        margin-top: 12px;
      }

      .playground-tasks-detail-threads-section .playground-plugins-section-header {
        margin-top: 0;
        padding-bottom: 0;
        border-bottom: 0;
      }

	      .playground-tasks-detail-threads-section .playground-plugins-section-title {
	        font-size: 14px;
	        font-weight: 400;
	        line-height: 1.3;
	      }

      .playground-tasks-detail-threads-section .playground-plugins-search-row {
        align-items: stretch;
        gap: 8px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-detail-threads-section .playground-plugins-search-shell {
        flex: 0 1 360px;
        width: min(360px, 100%);
        min-width: 0;
        max-width: 360px;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-shell {
        position: relative;
        overflow: hidden;
        border: 0;
        border-radius: 999px;
        background: transparent;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-shell::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-card-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-environments-action-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-connectors::before,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-facts::before {
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

      .playground-tasks-detail-threads-section .playground-plugins-search {
        min-height: 32px;
        font-size: 12px;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-icon {
        position: relative;
        z-index: 1;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search {
        min-height: 32px;
        line-height: 32px;
        padding-top: 0;
        padding-bottom: 0;
        border: 0;
        background: rgba(255, 255, 255, 0.05);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
        box-sizing: border-box;
      }

      .playground-tasks-detail-threads-section .playground-files-control-button {
        min-height: 32px;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-row {
        align-items: stretch;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-plugins-search-shell {
        height: auto;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-card-button,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-environments-action-button,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button {
        position: relative;
        overflow: hidden;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button {
        min-height: 32px;
        padding: 0 14px;
        align-items: center;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-card-button > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-environments-action-button > *,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button:hover,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-threads-section .playground-files-control-button.is-active,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-card-button:hover,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button:hover,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-environments-action-button:hover,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button:hover:enabled,
      .playground-tasks-detail-panel.is-project-task-detail .playground-tasks-detail-thread-footer .playground-tasks-review-action-button.is-approve:hover:enabled {
        background: transparent;
        color: #fff;
        opacity: 0.78;
      }

      .playground-tasks-detail-thread-list {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-tasks-detail-thread-row {
        width: calc(100% + 16px);
        min-width: 0;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-left: -8px;
        padding: 10px 8px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-tasks-detail-thread-row:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .playground-tasks-detail-thread-main {
        min-width: 0;
        flex: 1 1 auto;
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        grid-template-rows: auto;
        column-gap: 8px;
        align-items: center;
      }

      .playground-tasks-detail-thread-status-icon {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        grid-column: 1;
        grid-row: 1;
        align-self: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-tasks-detail-thread-status-icon svg {
        width: 11px;
        height: 11px;
      }

      .playground-tasks-detail-thread-status-icon.is-running,
      .playground-tasks-detail-thread-status-icon.is-permission {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-tasks-detail-thread-status-icon.is-running svg,
      .playground-tasks-detail-thread-status-icon.is-permission svg {
        animation: spinner-rotate 1s linear infinite;
      }

      .playground-tasks-detail-thread-status-icon.is-completed {
        background: rgba(95, 214, 154, 0.14);
        color: #5fd69a;
      }

      .playground-tasks-detail-thread-status-icon.is-failed {
        background: rgba(255, 112, 112, 0.14);
        color: #ff8585;
      }

      .playground-tasks-detail-thread-title {
        min-width: 0;
        grid-column: 2;
        grid-row: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-tasks-detail-thread-status {
        flex: 0 0 auto;
        max-width: 118px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-radius: 999px;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.62);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-tasks-detail-thread-status.is-running {
        background: rgba(102, 166, 255, 0.14);
        color: #8fc4ff;
      }

      .playground-tasks-detail-thread-status.is-permission {
        background: rgba(255, 214, 102, 0.14);
        color: #ffe099;
      }

      .playground-tasks-detail-thread-status.is-completed {
        background: rgba(120, 255, 194, 0.12);
        color: #93ffd0;
      }

      .playground-tasks-detail-thread-status.is-failed {
        background: rgba(255, 112, 112, 0.14);
        color: #ffb0b0;
      }

      .playground-tasks-detail-thread-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .playground-tasks-detail-thread-action {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, 0.54);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-tasks-detail-thread-action:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-tasks-detail-thread-empty {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 12px 0 2px;
      }

      .playground-tasks-detail-thread-empty-copy {
        min-width: 0;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-tasks-detail-thread-empty .playground-tasks-empty-primary-button {
        flex: 0 0 auto;
      }

      .playground-tasks-detail-thread-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 10px;
      }

      .playground-tasks-detail-thread-footer .playground-environments-action-button {
        min-height: 32px;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button {
        min-height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 14px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
        transition: opacity 160ms ease, transform 160ms ease;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button:hover:enabled {
        opacity: 0.7;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button.is-approve {
        border-color: #fff;
        background: #fff;
        color: #000;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button.is-approve:hover:enabled {
        opacity: 0.7;
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button:active:enabled {
        transform: translateY(1px);
      }

      .playground-tasks-detail-thread-footer .playground-tasks-review-action-button:disabled {
        opacity: 0.38;
        cursor: default;
      }

      @media (max-width: 620px) {
        .playground-tasks-detail-thread-row {
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .playground-tasks-detail-thread-status,
        .playground-tasks-detail-thread-actions {
          margin-left: 0;
        }
      }

      .playground-tasks-detail-facts {
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 4px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 10px;
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(50px);
      }

	      .playground-tasks-detail-facts::before {
	        content: none;
	        display: none;
	      }

		      .playground-server-detail-content .playground-database-browser-surface.playground-server-details-card,
	      .playground-server-detail-content .playground-auth-users-surface.playground-server-details-card {
	        --playground-project-overview-chart-border: linear-gradient(
	          -10deg,
	          rgba(200, 200, 200, 0.25),
	          rgba(255, 255, 255, 0.1),
	          rgba(255, 255, 255, 0.15),
	          rgba(255, 255, 255, 0.375)
	        );
	        position: relative;
	        margin-bottom: 24px;
	        padding: 20px;
	        border: 0;
	        border-radius: 15px;
	        overflow: hidden;
	        background: transparent;
	        -webkit-backdrop-filter: blur(50px);
	        backdrop-filter: blur(50px);
	      }

	      .playground-server-detail-content .playground-database-browser-surface.playground-server-details-card::before,
	      .playground-server-detail-content .playground-auth-users-surface.playground-server-details-card::before {
	        content: "";
	        display: block;
	        pointer-events: none;
	        position: absolute;
	        inset: 0;
	        z-index: 5;
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

	      .playground-server-detail-content .playground-database-browser-surface.playground-server-details-card > *,
	      .playground-server-detail-content .playground-auth-users-surface.playground-server-details-card > * {
	        position: relative;
	        z-index: 1;
	      }

	      .playground-server-detail-content .playground-database-browser-surface.playground-server-details-card {
	        padding: 0;
	      }

	      .playground-resources-page.is-develop-server-kind-page.is-database-data-tab {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page > .playground-environments-detail-scroll.playground-settings-detail-scroll.is-database-data-tab,
	      .playground-resources-page.is-develop-server-kind-page > .playground-environments-detail-scroll.playground-settings-detail-scroll:has(.playground-environments-editor-main.playground-tasks-detail-main.is-database-data-tab) {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        padding-bottom: 0;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-resources-detail-content.is-database-data-tab,
	      .playground-resources-page.is-develop-server-kind-page .playground-resources-detail-content:has(.playground-environments-editor-main.playground-tasks-detail-main.is-database-data-tab) {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        display: flex;
	        flex-direction: column;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-editor-main.playground-tasks-detail-main.is-database-data-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-editor-main.playground-tasks-detail-main.is-auth-users-tab {
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-detail-scroll.playground-environments-editor-scroll.is-database-data-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        overflow: hidden;
	      }

	      .playground-resources-page.is-develop-server-kind-page .playground-environments-detail-scroll.playground-environments-editor-scroll.is-auth-users-tab {
	        flex: 1 1 auto;
	        min-height: 0;
	        height: 100%;
	        overflow: hidden;
	      }

	      .playground-server-detail-content.is-database-data-tab {
	        flex: 1 1 0;
	        min-height: 0;
	        height: 100%;
	        max-height: 100%;
	        gap: 12px;
	        overflow: hidden;
	      }

	      .playground-database-detail-content.is-database-data-tab {
	        display: flex;
	        flex-direction: column;
	      }

	      .playground-database-detail-header-area {
	        flex: 0 0 auto;
	        min-height: 0;
	      }

	      .playground-database-detail-tab-panel {
	        min-width: 0;
	        min-height: 0;
	      }

	      .playground-database-detail-tab-panel.is-data {
	        flex: 1 1 0;
	        height: 100%;
	        max-height: 100%;
	        display: flex;
	        flex-direction: column;
	        overflow: hidden;
	      }

	      .playground-database-detail-tab-panel.is-usage,
	      .playground-database-detail-tab-panel.is-settings {
	        flex: 0 0 auto;
	      }

	      .playground-database-settings-root {
	        gap: 0;
	      }

	      .playground-database-deployment-map {
	        margin-bottom: 0;
	      }

	      .playground-database-description-section.platform-instructions-editor {
	        margin: 0;
	        padding-bottom: 3px !important;
	        box-sizing: border-box;
	      }

	      .playground-database-description-section .platform-instructions-editor__title {
	        font-size: 14px;
	      }

	      .playground-server-settings-tab .playground-environments-connections-title {
	        font-size: 14px;
	      }

	      .playground-database-settings-root .playground-database-danger-section {
	        margin-top: 24px;
	      }

	      .playground-database-api-quickstart-card {
	        margin-top: 24px;
	      }

	      .playground-database-detail-usage-header-actions {
	        width: 100%;
	        display: flex;
	        align-items: center;
	        justify-content: flex-end;
	      }

	      .playground-server-detail-usage-header {
	        justify-content: space-between;
	        gap: 16px;
	        margin-bottom: 12px;
	      }

	      .playground-server-detail-usage-title {
	        min-width: 0;
	        margin: 0;
	        color: rgba(255, 255, 255, 0.95);
	        font-size: 14px;
	        font-weight: 400;
	        line-height: 1.3;
	        white-space: nowrap;
	      }

	      .playground-database-detail-usage-metrics.playground-environments-home-metrics {
	        width: 100%;
	        margin-bottom: 0;
	      }

	      .playground-database-detail-usage-analytics-card .playground-settings-usage-chart-card {
	        padding: 0;
	        border: 0;
	        border-radius: 0;
	        background: transparent;
	        box-shadow: none;
	      }

	      .playground-database-detail-usage-analytics-card .playground-project-overview-chart-shell {
	        height: 270px;
	        border: 0;
	        background: transparent;
	      }

	      .playground-database-detail-usage-fact-rows {
	        width: 100%;
	        margin-top: 12px;
	      }

	      .playground-function-usage-invoke-section,
	      .playground-web-app-usage-fact-rows {
`;
