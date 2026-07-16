export const TEAMS_ROLES_AND_DIALOGS_CSS = `      .playground-team-roles-panel {
        overflow: visible;
      }

      .playground-team-role-assigned-shell {
        position: relative;
        flex: 0 0 auto;
      }

      .playground-team-role-assigned-button {
        border: 0;
        cursor: pointer;
        font-family: inherit;
      }

      .playground-team-role-assigned-button:hover,
      .playground-team-role-assigned-button.is-open {
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-team-role-assigned-popup {
        position: absolute;
        z-index: 80;
        top: calc(100% + 8px);
        right: 0;
        width: min(320px, 72vw);
      }

      .playground-team-role-assigned-popup-title {
        padding: 4px 6px 8px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.2;
      }

      .playground-team-role-assigned-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-team-role-assigned-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-width: 0;
        padding: 8px 6px;
        border-radius: 8px;
      }

      .playground-team-role-assigned-row:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      .playground-team-role-assigned-status {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.42);
        font-size: 11px;
        line-height: 1.2;
      }

      .playground-team-role-assigned-empty {
        padding: 12px 8px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-team-inline-editor {
        display: grid;
        grid-template-columns: minmax(220px, 1fr) 160px auto;
        gap: 10px;
        align-items: center;
        padding: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        box-sizing: border-box;
      }

      .playground-team-inline-editor.is-resource-share {
        grid-template-columns: 160px minmax(220px, 1fr) 140px auto;
      }

      .playground-auth-users-table-shell.playground-team-table-shell {
        position: relative;
        overflow-x: auto;
        border-radius: 10px;
        background: transparent;
      }

      .playground-auth-users-table-shell.playground-team-table-shell::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 4;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border, linear-gradient(-10deg, rgba(200, 200, 200, 0.25), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.375)));
        -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        -webkit-mask-clip: content-box, border-box;
        -webkit-mask-composite: xor;
        -webkit-mask-origin: content-box, border-box;
        -webkit-mask-repeat: repeat, repeat;
        -webkit-mask-size: auto, auto;
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-auth-users-table-shell.playground-team-table-shell > * {
        position: relative;
        z-index: 2;
      }

      .playground-auth-users-table.is-secrets-table .playground-team-table-col-main {
        width: 45%;
      }

      .playground-auth-users-table.is-secrets-table .playground-team-table-col-role {
        width: 22%;
      }

      .playground-auth-users-table.is-secrets-table .playground-team-table-col-meta {
        width: 23%;
      }

      .playground-auth-users-table.is-secrets-table .playground-team-table-col-actions {
        width: 56px;
      }

      .playground-auth-users-table.is-secrets-table.playground-team-members-table .playground-team-table-col-main {
        width: 39%;
      }

      .playground-auth-users-table.is-secrets-table.playground-team-members-table .playground-team-table-col-role {
        width: 18%;
      }

      .playground-auth-users-table.is-secrets-table.playground-team-members-table .playground-team-table-col-meta {
        width: 14%;
      }

      .playground-auth-users-table.is-secrets-table.playground-team-members-table .playground-team-table-col-joined {
        width: 19%;
      }

      .playground-team-table-title,
      .playground-team-table-meta {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-team-table-title {
        color: rgba(255, 255, 255, 0.94);
        font-size: 12px;
        font-weight: 600;
        line-height: 1.35;
      }

      .playground-team-member-cell {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-team-member-avatar {
        position: relative;
        width: 28px;
        height: 28px;
        flex: 0 0 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-size: 10px;
        font-weight: 400;
        line-height: 1;
      }

      .playground-team-member-avatar-image {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-team-member-avatar-fallback {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        line-height: 1;
        letter-spacing: 0;
        text-transform: uppercase;
        position: relative;
      }

      .playground-team-member-copy {
        min-width: 0;
      }

      .playground-team-table-meta {
        margin-top: 2px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.4;
      }

      .playground-team-table .playground-team-select {
        width: auto;
        height: auto;
        max-width: 150px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        font-size: 12px;
        line-height: 1.35;
      }

      .playground-team-table .playground-team-select:focus {
        border-color: transparent;
      }

      .playground-team-member-action-shell {
        justify-content: flex-end;
      }

      .playground-team-member-action-button {
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-team-member-action-button:hover:not(:disabled),
      .playground-team-member-action-shell.is-open .playground-team-member-action-button {
        border-color: transparent;
        background: transparent;
        color: #fff;
      }

      .playground-team-member-action-menu {
        min-width: 150px;
      }

      .playground-team-role-label {
        min-height: 0;
        padding: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-team-back-button {
        align-self: flex-start;
        margin-bottom: 0;
      }

      .playground-team-action-button {
        --playground-team-action-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        overflow: hidden;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-team-action-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-team-action-border);
        -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        -webkit-mask-clip: content-box, border-box;
        -webkit-mask-composite: xor;
        -webkit-mask-origin: content-box, border-box;
        -webkit-mask-repeat: repeat, repeat;
        -webkit-mask-size: auto, auto;
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-team-action-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-team-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.58);
        box-sizing: border-box;
      }

      .playground-team-modal {
        position: relative;
        width: min(520px, 100%);
        border-radius: 15px;
        background: rgba(18, 18, 19, 0.94);
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
        padding: 18px;
        box-sizing: border-box;
        color: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.34);
      }

      .playground-team-modal::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border);
        -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        -webkit-mask-clip: content-box, border-box;
        -webkit-mask-composite: xor;
        -webkit-mask-origin: content-box, border-box;
        -webkit-mask-repeat: repeat, repeat;
        -webkit-mask-size: auto, auto;
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-team-modal > * {
        position: relative;
        z-index: 1;
      }

      .playground-team-modal-backdrop.playground-team-mission-modal-backdrop {
        z-index: 10020;
        background: rgba(0, 0, 0, 0);
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        transition: background-color 75ms linear !important;
      }

      .playground-team-modal-backdrop.playground-team-mission-modal-backdrop.is-visible {
        background: rgba(0, 0, 0, 0.5);
      }

      .playground-team-modal.playground-team-mission-modal {
        --tb-runner-input-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        width: min(520px, calc(100vw - 48px));
        position: relative;
        overflow: visible;
        border: 0 !important;
        border-radius: 25px;
        background: linear-gradient(to bottom, black, rgba(30,30,30,0.5), rgba(30,30,30,0.5)) !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        backdrop-filter: blur(20px) !important;
        transform-origin: center;
        opacity: 0.5;
        transform: scale(0.5);
        transition: opacity 75ms linear, transform 75ms linear !important;
        will-change: opacity, transform;
      }

      .playground-team-modal.playground-team-mission-modal.is-visible {
        opacity: 1;
        transform: scale(1);
      }

      .playground-team-modal.playground-team-mission-modal::before {
        content: "" !important;
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        display: block !important;
        border-radius: inherit;
        padding: 1px;
        background: var(--tb-task-input-border, var(--tb-runner-input-border));
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-team-modal.playground-team-mission-modal > * {
        position: relative;
        z-index: 6;
      }

      .playground-team-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
      }

      .playground-team-modal-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 18px;
        font-weight: 500;
        line-height: 1.2;
      }

      .playground-team-modal-subtitle {
        margin: 6px 0 0;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.45;
      }

      .playground-team-modal-close {
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-team-modal-close:hover {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-team-modal-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-team-modal-form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .playground-team-modal-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .playground-team-modal-label {
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        font-weight: 500;
      }

      .playground-team-modal-help {
        margin: 2px 0 0;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.4;
      }

      .playground-team-textarea {
        height: auto;
        min-height: 96px;
        resize: vertical;
        padding: 10px 12px;
        line-height: 1.45;
      }

      .playground-team-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding-top: 4px;
      }

      .playground-team-modal-actions.is-split {
        align-items: center;
        justify-content: space-between;
      }

      .playground-team-modal-action-group {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-team-modal.is-share-resource {
        width: min(620px, calc(100vw - 48px));
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .playground-team-modal.is-share-resource .playground-team-modal-header {
        flex: 0 0 auto;
        margin-bottom: 14px;
      }

      .playground-team-modal.is-share-resource .playground-team-modal-subtitle {
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-team-share-picker {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-team-share-picker-bar {
        display: flex;
        justify-content: stretch;
        align-items: center;
        gap: 12px;
      }

      .playground-team-share-access-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .playground-team-share-access-label {
        color: #fff;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-team-share-picker-type {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-team-share-picker-type-icon {
        width: 30px;
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.82);
        flex: 0 0 auto;
      }

      .playground-team-share-access-select.playground-team-select {
        height: 34px;
        min-height: 34px;
        padding: 0 30px 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        background-color: rgba(0, 0, 0, 0.45);
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
      }

      .playground-team-share-access-shell.playground-tasks-detail-select-shell.playground-environments-runtime-popup-shell {
        width: auto;
        flex: 0 0 auto;
      }

      .playground-team-share-access-shell .playground-tasks-detail-select-trigger {
        min-height: 34px;
      }

      .playground-team-share-access-shell .playground-tasks-toolbar-popup-menu {
        width: 180px;
        min-width: 180px;
      }

      .playground-team-share-resource-selector.playground-tasks-project-blueprint-section {
        margin: 0;
        gap: 0;
      }

      .playground-team-share-resource-selector .playground-tasks-project-blueprint-trigger {
        min-height: 54px;
      }

      .playground-team-share-resource-selector .playground-tasks-project-blueprint-popover {
        z-index: 160;
      }

      .playground-team-share-resource-list {
        flex: 1 1 auto;
        min-height: 0;
        max-height: 310px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow: auto;
        padding-right: 4px;
        scrollbar-width: none;
      }

      .playground-team-share-resource-list::-webkit-scrollbar {
        display: none;
      }

      .playground-team-share-resource-option {
        width: 100%;
        min-height: 52px;
        display: grid;
        grid-template-columns: 32px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border: 0;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.86);
        text-align: left;
        cursor: pointer;
        transition: background-color 150ms ease, color 150ms ease;
      }

      .playground-team-share-resource-option:hover,
      .playground-team-share-resource-option.is-selected {
        background: rgba(255, 255, 255, 0.09);
        color: #ffffff;
      }

      .playground-team-share-resource-option-icon {
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.76);
      }

      .playground-team-share-resource-option-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-team-share-resource-option-title {
        min-width: 0;
        color: inherit;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-team-share-resource-option-meta {
        min-width: 0;
        color: rgba(255, 255, 255, 0.42);
        font-size: 11px;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-team-share-resource-option-check {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
      }

      .playground-team-share-resource-option.is-selected .playground-team-share-resource-option-check {
        border-color: rgba(255, 255, 255, 0.72);
        background: rgba(255, 255, 255, 0.18);
      }

      .playground-team-share-empty {
        min-height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.45;
        text-align: center;
        padding: 20px;
      }

      .playground-team-share-create-new {
        width: 100%;
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0;
        border: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: transparent;
        color: rgba(255, 255, 255, 0.84);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
      }

      .playground-team-share-create-new:hover {
        color: #ffffff;
      }

      .playground-team-modal.is-share-resource .playground-team-modal-actions {
        flex: 0 0 auto;
        padding-top: 0;
      }

      .playground-team-modal.is-share-resource .playground-team-button {
        height: 34px;
        font-size: 12px;
        font-weight: 400;
      }

      .playground-team-button.is-danger {
        border-color: rgba(255, 113, 113, 0.28);
        background: rgba(255, 113, 113, 0.08);
        color: #ff9a9a;
      }

      .playground-team-button.is-danger:hover:not(:disabled) {
        border-color: rgba(255, 113, 113, 0.46);
        background: rgba(255, 113, 113, 0.14);
        color: #ffd0d0;
      }

`;

