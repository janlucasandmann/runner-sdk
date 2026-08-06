export const TEAMS_FOUNDATION_CSS = `      .playground-team-page {
        width: 100%;
        height: 100%;
        min-height: 0;
        padding: 42px 50px 56px;
        background: #000;
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: none;
      }

      .playground-team-page.is-team-overview-page {
        padding: 0;
        overflow: hidden;
        background: #000;
      }

      .playground-team-page.is-team-overview-page .playground-team-shell {
        width: 100%;
        max-width: none;
        height: 100%;
        min-height: 0;
        padding: 0;
        gap: 0;
      }

      .playground-team-page::-webkit-scrollbar {
        display: none;
      }

      .playground-team-shell {
        width: min(100%, var(--playground-centered-page-max-width));
        margin: 0 auto;
        padding: 0 0 56px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-sizing: border-box;
      }

      .playground-team-shell.is-plan-empty {
        height: 100%;
        padding: 0;
        align-items: center;
        justify-content: center;
      }

      .playground-team-detail-content {
        width: min(100%, var(--platform-page-content-max-width, 87.5rem));
        max-width: var(--platform-page-content-max-width, 87.5rem);
        gap: 0;
      }

      .playground-team-detail-profile-section .playground-team-detail-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 18px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-team-detail-role-label {
        min-height: 22px;
        padding: 0 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        color: #fff;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-team-detail-sidebar-card.platform-ui-card.is-sidebar {
        padding: 16px;
      }

      .playground-team-detail-sidebar-facts,
      .playground-team-detail-sidebar-actions,
      .playground-team-detail-sidebar-access {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-team-detail-sidebar-fact {
        min-width: 0;
        min-height: 26px;
        display: grid;
        grid-template-columns: minmax(80px, 0.8fr) minmax(0, 1.2fr);
        align-items: center;
        gap: 12px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        font-weight: 400;
      }

      .playground-team-detail-sidebar-fact-label {
        min-width: 0;
      }

      .playground-team-detail-sidebar-fact-value {
        min-width: 0;
        overflow: hidden;
        color: #fff;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-team-detail-sidebar-action.platform-button {
        justify-content: flex-start;
      }

      .playground-team-detail-owner {
        min-width: 0;
        gap: 8px;
        justify-content: flex-end;
      }

      .playground-team-detail-owner-avatar.playground-team-member-avatar {
        width: 20px;
        height: 20px;
        flex-basis: 20px;
      }

      .playground-team-detail-creator {
        min-width: 0;
        gap: 8px;
        justify-content: flex-end;
      }

      .playground-team-detail-creator-avatar.playground-team-member-avatar {
        width: 20px;
        height: 20px;
        flex-basis: 20px;
      }

      .playground-team-detail-creator .playground-team-table-title {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        font-weight: 400;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-team-detail-sidebar-owner-row {
        width: 100%;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-team-detail-sidebar-owner-cell,
      .playground-team-detail-owner-selector,
      .playground-team-detail-owner-trigger {
        width: 100%;
        min-width: 0;
        max-width: 100%;
      }

      .playground-team-detail-sidebar-owner-cell {
        overflow: visible;
      }

      .playground-team-detail-owner-trigger {
        justify-content: flex-end;
        text-align: right;
      }

      .playground-team-detail-owner-trigger .playground-team-member-cell {
        min-width: 0;
        overflow: hidden;
      }

      .playground-team-detail-owner-trigger .playground-team-table-title {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        font-weight: 400;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-team-detail-invite-button.platform-button {
        width: 100%;
        margin-top: 12px;
      }

      .playground-team-detail-owner-option-avatar {
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        font-size: 10px;
        font-weight: 500;
      }

      .playground-team-detail-owner-popup {
        width: 260px;
      }

      .playground-team-create-profile-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-team-create-profile-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-team-create-profile-description {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.4;
        font-weight: 400;
      }

      .playground-team-plan-empty {
        width: min(100%, 420px);
        min-height: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        color: rgba(255, 255, 255, 0.48);
        text-align: center;
      }

      .playground-team-plan-empty-visual {
        width: 220px;
        max-width: min(220px, 70vw);
        height: auto;
        object-fit: contain;
      }

      .playground-team-plan-empty-title {
        margin: 0;
        max-width: 390px;
        color: rgba(255, 255, 255, 0.94);
        font-size: 18px;
        line-height: 1.15;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-team-plan-empty-copy {
        margin: 0;
        max-width: 380px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
      }

      .playground-team-plan-empty-button {
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        padding: 0 14px;
        background: #fff;
        color: #000;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-team-plan-empty-button:hover {
        background: rgba(255, 255, 255, 0.9);
      }

      .playground-team-hero,
      .playground-team-card {
        position: relative;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        overflow: hidden;
      }

      .playground-team-hero::before,
      .playground-team-card::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 1;
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

      .playground-team-hero > *,
      .playground-team-card > * {
        position: relative;
        z-index: 2;
      }

      .playground-team-hero {
        min-height: 170px;
        padding: 24px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        box-sizing: border-box;
      }

      .playground-team-eyebrow {
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .playground-team-title {
        max-width: 760px;
        margin: 0;
        color: #fff;
        font-size: 32px;
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-team-muted {
        margin: 8px 0 0;
        max-width: 660px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 13px;
        line-height: 1.45;
        font-weight: 400;
      }

      .playground-team-hero-meta {
        min-width: 180px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
      }

      .playground-team-hero-meta strong {
        color: #fff;
        font-size: 18px;
        font-weight: 500;
      }

      .playground-team-error {
        border-radius: 12px;
        padding: 10px 12px;
        background: rgba(255, 82, 82, 0.12);
        color: #ffb3b3;
        font-size: 12px;
      }

      .playground-team-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .playground-team-card {
        padding: 18px;
        box-sizing: border-box;
      }

      .playground-team-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }

      .playground-team-card-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 18px;
        font-weight: 500;
        line-height: 1.2;
      }

      .playground-team-form {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-team-form.is-stacked {
        align-items: stretch;
        flex-direction: column;
      }

      .playground-team-form-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .playground-team-input,
      .playground-team-select {
        min-width: 0;
        width: 100%;
        height: 38px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.22);
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 400;
        outline: none;
        box-sizing: border-box;
      }

      .playground-team-input {
        padding: 0 12px;
      }

      .playground-team-select {
        padding: 0 34px 0 12px;
      }

      .playground-team-team-select {
        max-width: 280px;
      }

      .playground-team-input::placeholder {
        color: rgba(255, 255, 255, 0.36);
      }

      .playground-team-input:focus,
      .playground-team-select:focus {
        border-color: rgba(102, 166, 255, 0.7);
      }

      .playground-team-button,
      .playground-team-icon-button {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
      }

      .playground-team-button {
        height: 38px;
        padding: 0 16px;
        white-space: nowrap;
      }

      .playground-team-button:hover:not(:disabled),
      .playground-team-icon-button:hover:not(:disabled) {
        border-color: rgba(255, 255, 255, 0.24);
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .playground-team-button.is-primary {
        border-color: #fff;
        background: #fff;
        color: #000;
      }

      .playground-team-button:disabled,
      .playground-team-icon-button:disabled {
        opacity: 0.48;
        cursor: default;
      }

      .playground-team-list {
        display: flex;
        flex-direction: column;
      }

      .playground-team-row {
        min-height: 56px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 140px auto;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-team-row:first-child {
        border-top: 0;
      }

      .playground-team-row-main {
        min-width: 0;
      }

      .playground-team-row-title {
        overflow: hidden;
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-team-row-meta {
        margin-top: 3px;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-team-badge {
        justify-self: start;
        min-height: 26px;
        display: inline-flex;
        align-items: center;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.76);
        font-size: 12px;
        font-weight: 500;
      }

      .playground-team-resource-source-badge {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-team-resource-access-label,
      .playground-team-resource-source-label,
      .playground-team-resource-owner-label {
        min-height: 0;
        padding: 0;
        border-radius: 0;
        background: transparent;
        max-width: none;
        overflow: visible;
        text-overflow: clip;
        white-space: nowrap;
      }

      .playground-team-resource-owner-cell {
        min-width: 0;
        max-width: 100%;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-team-resources-panel .playground-project-resources-row.has-source-column.has-owner-column > :nth-child(5),
      .playground-team-resources-panel .playground-project-resources-row.has-selection-column.has-source-column.has-owner-column > :nth-child(6) {
        min-height: 100%;
        display: flex;
        align-items: center;
      }

      .playground-team-resource-owner-avatar {
        --playground-team-resource-owner-avatar-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-size: 8px;
        font-weight: 400;
        line-height: 1;
      }

      .playground-team-resource-owner-avatar:has(> .playground-team-resource-owner-avatar-fallback)::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-team-resource-owner-avatar-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-team-resource-owner-avatar-image {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-team-resource-owner-avatar-fallback {
        width: 100%;
        height: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        letter-spacing: 0;
        text-transform: uppercase;
        position: relative;
      }

      .playground-team-icon-button {
        width: 32px;
        height: 32px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-team-empty {
        min-height: 72px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.46);
        font-size: 13px;
      }

      .playground-team-page-header {
        align-items: flex-end;
        margin: 0 0 12px;
        padding: 0;
      }

      .playground-team-page-title {
        margin: 0;
      }

      .playground-team-page-subtitle {
        margin: 8px 0 0;
        max-width: 620px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.45;
      }

      .playground-team-overview-page {
        width: 100%;
      }

      .playground-team-overview-page .playground-environments-home-content {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        gap: 24px;
      }

      .playground-team-overview-page .playground-environments-home-hero {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-team-overview-page .playground-develop-server-kind-header {
        margin: 0 0 12px;
        padding-bottom: 12px;
      }

      .playground-team-overview-empty-metrics.playground-environments-home-metrics {
        height: 364px;
        min-height: 364px;
        max-height: 364px;
        margin-top: 12px;
        margin-bottom: 0;
        display: block;
      }

      .playground-team-overview-empty-chart {
        width: 100%;
        height: 100%;
        min-height: 0;
      }

      .playground-team-overview-table-section .playground-team-overview-action-shell {
        position: relative;
      }

	      .playground-team-overview-table-section .playground-team-overview-action-shell .playground-agents-overview-toolbar-menu {
	        left: auto;
	        right: 0;
	        transform-origin: top right;
	      }

	      .playground-team-overview-table-section .playground-organization-overview-action-shell .playground-agents-overview-toolbar-menu,
	      .playground-team-overview-table-section .playground-tags-overview-action-shell .playground-agents-overview-toolbar-menu,
	      .playground-organization-members-table-section .playground-organization-member-action-shell .playground-agents-overview-toolbar-menu {
	        left: auto;
	        right: 0;
	        transform-origin: top right;
	      }

      .playground-project-overview-panel-plain.playground-plugins-section {
        gap: 0 !important;
      }

      .playground-project-overview-panel-plain.playground-plugins-section .playground-project-overview-threads-table-header {
        padding-top: 12px;
      }

      .playground-team-overview-table-section .playground-team-overview-sticky-table-header .playground-develop-server-kind-table-toolbar {
        flex-wrap: nowrap;
      }

      .playground-team-overview-table-section .playground-team-overview-sticky-table-header .playground-develop-server-kind-table-controls {
        flex: 1 1 auto;
        width: auto;
        min-width: 0;
        flex-wrap: nowrap;
      }

      .playground-team-overview-table-section .playground-team-overview-sticky-table-header .playground-develop-server-kind-search-shell {
        flex: 0 1 340px;
        width: min(340px, 100%);
        min-width: 0;
        max-width: 340px;
      }

      .playground-team-overview-table-section .playground-team-overview-sticky-table-header .playground-plugins-toolbar-controls {
        flex-wrap: nowrap;
        flex: 0 0 auto;
      }

      .playground-team-overview-table-section .playground-team-overview-sticky-table-header .playground-agents-overview-toolbar-create-button {
        flex: 0 0 auto;
      }

      .playground-team-overview-toolbar-row {
        position: relative;
        z-index: 501;
        display: flex !important;
        align-items: center;
        justify-content: flex-start;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        gap: 10px;
        width: 100%;
        padding: 0 0 12px;
        margin: 0;
        border-bottom: 0;
        pointer-events: auto;
      }

      .playground-team-overview-toolbar-row > *,
      .playground-team-overview-toolbar-row .playground-plugins-toolbar-controls,
      .playground-team-overview-toolbar-row .playground-files-toolbar-anchor,
      .playground-team-overview-toolbar-row .playground-develop-server-kind-search-shell,
      .playground-team-overview-toolbar-row .playground-plugins-search,
      .playground-team-overview-toolbar-row button {
        position: relative;
        z-index: 502;
        pointer-events: auto;
      }

      .playground-team-overview-toolbar-row .playground-develop-server-kind-search-shell {
        flex: 0 1 340px;
        width: min(340px, 100%);
        min-width: 0;
        max-width: 340px;
      }

	      .playground-team-overview-toolbar-row .playground-plugins-toolbar-controls {
	        flex: 0 0 auto;
	        flex-wrap: nowrap;
	      }

	      .playground-team-overview-toolbar-row .playground-plugins-search-icon {
	        z-index: 503;
	        opacity: 1;
	        color: rgba(255, 255, 255, 0.42);
	      }

	      .playground-team-overview-toolbar-row .playground-agents-overview-toolbar-create-button {
	        flex: 0 0 auto;
	        margin-left: auto;
	      }

	      .playground-tags-overview-status-label {
	        display: inline-flex;
	        align-items: center;
	        justify-content: center;
	        width: fit-content;
	        min-height: 22px;
	        padding: 0 8px;
	        border: 0;
	        border-radius: 5px;
	        font-size: 12px;
	        font-weight: 400;
	        line-height: 1;
	        white-space: nowrap;
	      }

	      .playground-tags-overview-status-label.is-connected {
	        background: rgba(133, 223, 123, 0.1);
	        color: #85DF7B;
	      }

	      .playground-tags-overview-status-label.is-not-connected {
	        background: rgba(255, 255, 255, 0.1);
	        color: rgba(255, 255, 255, 0.7);
	      }

      .playground-team-grid-table-section.playground-agents-overview-list-section {
        position: relative;
        isolation: isolate;
        margin-top: 0 !important;
        margin-bottom: 24px;
        padding: 0 18px 6px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 15px;
        overflow: visible !important;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-team-grid-table-section .playground-agents-overview-sticky-table-header {
        position: sticky;
        top: 0;
        z-index: 240;
        margin: 0 -18px;
        padding: 12px 18px 0;
        border-radius: 15px 15px 0 0;
        background: #121212;
      }

      .playground-team-grid-table-section .playground-project-overview-threads-table {
        position: relative;
        z-index: 0;
        width: 100%;
        margin-left: 0;
        padding-left: 0;
        padding-right: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        overflow: visible !important;
      }

      .playground-team-grid-table-section .playground-project-overview-thread-list {
        position: relative;
        z-index: 0;
        width: calc(100% + 24px);
        margin-left: -12px;
        padding-left: 12px;
        padding-right: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: #000;
        overflow: visible !important;
      }

      .playground-team-grid-table-section .playground-project-overview-threads-table-header,
      .playground-team-grid-table-section .playground-project-overview-threads-table-row {
        gap: 12px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        font-size: 12px;
      }

      .playground-team-grid-table-section .playground-project-overview-threads-table-header *,
      .playground-team-grid-table-section .playground-project-overview-threads-table-row * {
        font-size: 12px;
      }

      .playground-team-grid-table-section .playground-project-overview-threads-table-row {
        min-height: 58px;
        padding-top: 12px;
        padding-bottom: 12px;
        overflow: visible !important;
      }

	      .playground-team-grid-table-section .playground-project-overview-thread-list > .playground-project-overview-threads-table-row:last-child {
	        border-bottom: 0;
	      }

	      .playground-team-resources-panel .playground-project-resources-table-card {
	        position: relative;
	        isolation: isolate;
	        margin-top: 0 !important;
	        margin-bottom: 24px;
	        padding: 0 18px 6px;
	        border: 1px solid rgba(255, 255, 255, 0.075);
	        border-radius: 15px;
	        overflow: visible !important;
	        background: rgba(255, 255, 255, 0.075);
	      }

	      .playground-team-resources-panel .playground-project-resources-table-inner {
	        display: flex;
	        flex-direction: column;
	        gap: 0;
	        overflow: visible !important;
	      }

		      .playground-team-resources-panel .playground-project-resources-toolbar {
		        position: sticky;
		        top: 0;
		        z-index: 520;
	        margin: 0 -18px;
	        width: calc(100% + 36px);
	        padding: 12px 18px;
	        border-radius: 15px 15px 0 0;
	        background: #121212;
	        display: grid !important;
	        grid-template-columns: minmax(220px, 360px) minmax(0, 1fr);
	        align-items: center;
	        gap: 24px;
	        justify-content: stretch !important;
	      }

		      .playground-project-resources-search {
		        --playground-files-library-search-border: linear-gradient(
		          -10deg,
		          rgba(200, 200, 200, 0.25),
		          rgba(255, 255, 255, 0.1),
		          rgba(255, 255, 255, 0.15),
		          rgba(255, 255, 255, 0.375)
		        );
		        width: min(100%, 360px);
		        height: 32px;
		        display: inline-flex;
		        align-items: center;
		        gap: 10px;
		        padding: 0 14px;
		        border: 0;
		        border-radius: 999px;
		        color: rgba(255, 255, 255, 0.88);
		        box-sizing: border-box;
		        position: relative;
		        z-index: 0;
		        overflow: hidden;
		        -webkit-backdrop-filter: blur(50px);
		        backdrop-filter: blur(50px);
		      }

		      .playground-project-resources-search::before {
		        content: "";
		        pointer-events: none;
		        position: absolute;
		        inset: 0;
		        border-radius: inherit;
		        padding: 1px;
		        background: var(--playground-files-library-search-border);
		        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
		        mask-clip: content-box, border-box;
		        mask-composite: exclude;
		        mask-origin: content-box, border-box;
		        mask-repeat: repeat, repeat;
		        mask-size: auto, auto;
		      }

		      .playground-project-resources-search > * {
		        position: relative;
		        z-index: 1;
		      }

		      .playground-project-resources-search-input {
		        min-width: 0;
		        flex: 1;
		        border: 0;
		        outline: none;
		        background: transparent;
		        color: #fff;
		        font: inherit;
		        font-size: 12px;
		        line-height: 1;
		      }

		      .playground-project-resources-search-input::placeholder {
		        color: rgba(255, 255, 255, 0.5);
		      }

		      .playground-team-resources-panel .playground-project-resources-toolbar > .playground-project-resources-search {
			        grid-column: 1;
			        width: min(100%, 360px);
		        min-width: 0;
	      }

	      .playground-team-resources-panel .playground-project-resources-toolbar-actions {
	        width: 100% !important;
	        margin-left: auto !important;
	        flex: 1 1 auto !important;
	        display: flex !important;
	        justify-content: flex-end !important;
	        justify-self: stretch !important;
	        grid-column: 2;
	      }

	      .playground-team-resources-panel .playground-project-resources-new-shell {
	        order: 999 !important;
	        margin-left: 10px !important;
	      }

	      .playground-team-resources-panel .playground-project-resources-filter-shell {
	        order: 1;
	      }

	      .playground-team-resources-panel .playground-project-resources-toolbar-actions > .playground-files-library-divider {
	        order: 2;
	      }

	      .playground-team-resources-panel .playground-project-resources-toolbar-actions > .playground-files-library-icon-button {
	        order: 3;
	      }

	      .playground-team-resources-panel .playground-files-library-new-button.playground-agents-nav-create-button {
	        height: 30px;
	        min-height: 30px;
	        padding: 0 10px;
	        background: linear-gradient(to top, #082673, #1D59BE);
	      }

	      .playground-team-resources-panel .playground-files-library-new-button.playground-agents-nav-create-button:hover,
	      .playground-team-resources-panel .playground-files-library-new-button.playground-agents-nav-create-button:focus-visible,
	      .playground-team-resources-panel .playground-files-library-new-button.playground-agents-nav-create-button.is-active {
	        background: linear-gradient(to top, #082673, #1D59BE);
	      }

	      .playground-team-resources-panel .playground-project-resources-list-shell {
	        position: relative;
	        z-index: 0;
	        width: calc(100% + 24px);
	        margin-left: -12px;
	        padding-left: 12px;
	        padding-right: 12px;
	        border: 1px solid rgba(255, 255, 255, 0.1);
	        border-top: 0;
	        border-radius: 10px;
	        background: #000;
	        overflow: visible !important;
	      }

	      .playground-team-resources-panel .playground-project-resources-row {
	        min-height: 58px;
	        display: grid;
	        align-items: center;
	        gap: 12px;
	        width: 100%;
	        max-width: 100%;
	        box-sizing: border-box;
	        padding: 12px 0;
	        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	        font-size: 12px;
	        overflow: visible !important;
	      }

	      .playground-team-resources-panel .playground-project-resources-row.has-source-column.has-owner-column {
	        grid-template-columns: minmax(260px, 1.35fr) minmax(110px, 0.42fr) minmax(170px, 0.72fr) minmax(110px, 0.36fr) minmax(180px, 0.72fr) 28px;
	      }

	      .playground-team-resources-panel .playground-project-resources-row.has-selection-column.has-source-column.has-owner-column {
	        grid-template-columns: 21px minmax(260px, 1.35fr) minmax(110px, 0.42fr) minmax(170px, 0.72fr) minmax(110px, 0.36fr) minmax(180px, 0.72fr) 28px;
	      }

	      .playground-team-resources-panel .playground-project-resources-row.has-selection-column > div:first-child,
	      .playground-team-resources-panel .playground-project-resources-cell.is-select {
	        display: flex;
	        align-items: center;
	        justify-content: center;
	      }

	      .playground-team-resources-panel .playground-project-resources-row.is-header {
	        position: sticky;
	        top: 56px;
	        z-index: 510;
	        min-height: auto;
	        padding-top: 12px;
	        padding-bottom: 12px;
	        background: #000;
	        color: rgba(255, 255, 255, 0.5);
	        font-weight: 400;
	        border-top: 0;
	      }

	      .playground-team-resources-panel .playground-project-resources-row.is-header .playground-agents-overview-sortable-header {
	        width: 100%;
	        justify-content: flex-start;
	      }

	      .playground-team-resources-panel .playground-project-resources-row *,
	      .playground-team-resources-panel .playground-project-resources-cell,
	      .playground-team-resources-panel .playground-project-resource-title-main,
	      .playground-team-resources-panel .playground-project-resource-title-sub {
	        font-size: 12px;
	      }

	      .playground-team-resources-panel .playground-project-resources-list-shell > .playground-project-resources-row:last-child {
	        border-bottom: 0;
	      }

	      .playground-team-members-table-section .playground-project-overview-threads-table-header,
	      .playground-team-members-table-section .playground-project-overview-threads-table-row {
        grid-template-columns: 21px minmax(260px, 1.35fr) minmax(150px, 0.52fr) minmax(120px, 0.38fr) minmax(120px, 0.38fr) 28px;
      }

      .playground-team-members-table-section .playground-project-overview-threads-table-header > div:first-child,
      .playground-team-members-table-section .playground-project-overview-thread-cell.is-select {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-team-members-table-section .playground-project-overview-thread-cell,
      .playground-team-members-table-section .playground-team-table-title,
      .playground-team-members-table-section .playground-team-table-meta,
      .playground-team-members-table-section .playground-agents-overview-table-value {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-team-members-table-section .playground-project-overview-thread-cell.is-model {
        justify-self: start;
      }

      .playground-team-member-role-select-shell {
        position: relative;
        width: auto;
        min-width: 0;
        max-width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-team-members-table-section .playground-team-member-role-select {
        width: auto;
        min-width: 0;
        max-width: 100%;
        height: 30px;
        min-height: 0;
        padding: 0 25px 0 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
        font: inherit;
        font-size: 12px;
        line-height: 30px;
        cursor: pointer;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
      }

      .playground-team-members-table-section .playground-team-member-role-select:focus {
        border-color: transparent;
      }

      .playground-team-members-table-section .playground-team-member-role-select:disabled {
        cursor: default;
        opacity: 0.55;
      }

      .playground-team-member-role-select-icon {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-team-members-table-section .playground-team-member-role-select option {
        background: #171718;
        color: #fff;
      }

      .playground-team-members-table-section .playground-team-members-table-toolbar {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: nowrap;
        gap: 10px;
        padding: 0 0 12px;
        margin: 0;
        border-bottom: 0;
        width: 100%;
        pointer-events: auto;
      }

      .playground-team-members-toolbar-row > *,
      .playground-team-members-toolbar-row .playground-plugins-toolbar-controls,
      .playground-team-members-toolbar-row .playground-files-toolbar-anchor,
      .playground-team-members-toolbar-row .playground-develop-server-kind-search-shell,
      .playground-team-members-toolbar-row .playground-plugins-search,
      .playground-team-members-toolbar-row button {
        position: relative;
        z-index: 502;
        pointer-events: auto;
      }

      .playground-team-members-toolbar-row .playground-develop-server-kind-search-shell {
        flex: 0 1 340px;
        width: min(340px, 100%);
        min-width: 0;
        max-width: 340px;
        background: rgba(255, 255, 255, 0.025) !important;
      }

      .playground-team-members-toolbar-row .playground-plugins-toolbar-controls {
        flex: 0 0 auto;
        flex-wrap: nowrap;
      }

      .playground-team-members-table-section .playground-agents-overview-toolbar-create-button {
        flex: 0 0 auto;
        margin-left: auto;
      }

      .playground-team-members-table-section .playground-plugins-empty {
        min-height: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .playground-team-overview-layout {
        display: block;
        align-items: start;
      }

      .playground-team-table-panel,
      .playground-team-side-panel,
      .playground-team-detail-panel {
        position: relative;
        border-radius: 0;
        background: transparent;
        overflow: visible;
      }

      .playground-team-table-panel::before,
      .playground-team-side-panel::before,
      .playground-team-detail-panel::before {
        display: none;
      }

      .playground-team-table-panel > *,
      .playground-team-side-panel > *,
      .playground-team-detail-panel > * {
        position: relative;
        z-index: 2;
      }

      .playground-team-side-panel {
        min-height: 190px;
        padding: 18px;
        box-sizing: border-box;
      }

      .playground-team-side-title {
        color: rgba(255, 255, 255, 0.94);
        font-size: 18px;
        font-weight: 500;
        line-height: 1.2;
      }

      .playground-team-detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin: 0;
      }

      .playground-team-detail-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        flex-wrap: wrap;
      }

      .playground-team-detail-title {
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        font-size: 18px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-team-detail-meta {
        margin-top: 6px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        font-weight: 400;
      }

      .playground-team-detail-tabs {
        margin-bottom: 12px;
      }

      .playground-team-detail-panel {
        padding: 0;
      }

`;
