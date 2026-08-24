export const PROJECT_UPDATES_CSS_FRAGMENT = `
      .platform-project-update-card {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 28px;
        padding: 18px 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: transparent;
      }

      .platform-project-update-card__header,
      .platform-project-update-card__meta,
      .platform-project-update-modal__status-row {
        display: flex;
        align-items: center;
      }

      .platform-project-update-card__header {
        min-height: 28px;
        justify-content: space-between;
        gap: 16px;
      }

      .platform-project-update-card__action.platform-button.is-secondary {
        min-height: 28px;
        padding: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.58);
      }

      .platform-project-update-card__action.platform-button.is-secondary:hover {
        background: transparent;
        color: #fff;
      }

      .platform-project-update-card__meta {
        flex: 1 1 auto;
        min-width: 0;
        flex-wrap: wrap;
        gap: 10px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.4;
      }

      .platform-project-update-card__author {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        margin-left: auto;
        color: rgba(255, 255, 255, 0.82);
      }

      .platform-project-update-card__author .playground-project-overview-sidebar-avatar {
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        font-size: 8px;
      }

      .platform-project-update-card__time {
        color: rgba(255, 255, 255, 0.5);
      }

      .platform-project-update-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #4ade80;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 400;
      }

      .platform-project-update-status.is-at-risk {
        color: #facc15;
      }

      .platform-project-update-status.is-off-track {
        color: #f87171;
      }

      .platform-project-update-status.is-complete {
        color: #8b9dff;
      }

      .platform-project-update-status__icon {
        width: 14px;
        height: 14px;
        flex: 0 0 14px;
        display: inline-grid;
        place-items: center;
      }

      .platform-project-update-status__dot {
        width: 8px;
        height: 8px;
        flex: 0 0 8px;
        border-radius: 50%;
        background: #4ade80;
      }

      .platform-project-update-status__dot.is-at-risk {
        background: #facc15;
      }

      .platform-project-update-status__dot.is-off-track {
        background: #f87171;
      }

      .platform-project-update-status__dot.is-complete {
        background: #8b9dff;
      }

      .platform-project-update-card__content.platform-instructions-editor {
        margin: 0;
      }

      .platform-project-update-card__content .platform-instructions-editor__header {
        display: none;
      }

      .platform-project-update-card__content .platform-instructions-editor__body,
      .platform-project-update-card__content .platform-instructions-editor__content-viewport,
      .platform-project-update-card__content .platform-instructions-editor__readonly {
        margin: 0;
        padding: 0;
        background: transparent;
      }

      .platform-project-update-card__content .platform-instructions-editor__readonly {
        color: #fff;
        font-size: 14px;
        line-height: 1.55;
      }

      .platform-project-update-card__interaction-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .platform-project-update-card__interaction-actions
        > .platform-project-update-card__emoji-picker {
        flex: 0 0 auto;
      }

      .platform-project-update-card__interaction-actions .platform-icon-button {
        border-radius: 50%;
        color: rgba(255, 255, 255, 0.58);
        background: transparent;
      }

      .platform-project-update-card__interaction-actions .platform-icon-button:hover,
      .platform-project-update-card__interaction-actions .platform-icon-button.is-active,
      .platform-project-update-card__emoji-picker.platform-popup-anchor.is-open .platform-icon-button {
        color: #fff;
        background: rgba(255, 255, 255, 0.075);
      }

      .platform-project-update-card__reactions {
        min-width: 0;
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      .platform-project-update-card__reaction {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        min-height: 26px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 8px;
        padding: 2px 8px;
        color: rgba(255, 255, 255, 0.7);
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        font: inherit;
        font-size: 10px;
      }

      .platform-project-update-card__reaction:hover,
      .platform-project-update-card__reaction.is-selected {
        border-color: rgba(77, 163, 255, 0.4);
        color: #fff;
        background: rgba(77, 163, 255, 0.12);
      }

      .platform-project-update-card__reaction:disabled {
        cursor: wait;
        opacity: 0.58;
      }

      .platform-project-update-card__reaction-emoji {
        font-size: 14px;
        line-height: 1;
      }

      .platform-project-update-card__comments {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        min-width: 0;
      }

      .platform-project-update-card__comment.platform-comment-card {
        --platform-comment-card-radius: 10px;
      }

      .platform-project-update-card__comment-composer.platform-comment-composer {
        --platform-comment-composer-radius: 10px;
        margin-top: 0;
      }

      .platform-project-update-card__comment-text {
        width: 100%;
        min-width: 0;
      }

      .platform-project-update-card__comment-attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }

      .platform-project-update-card__interaction-error {
        color: #f87171;
        font-size: 11px;
        line-height: 1.4;
      }

      .platform-project-update-card__empty-copy {
        margin: 0;
        color: rgba(255, 255, 255, 0.42);
        font-size: 13px;
        line-height: 1.55;
      }

      .platform-project-update-modal__body {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .platform-project-update-modal__status-row {
        min-height: 32px;
        justify-content: space-between;
        gap: 16px;
      }

      .platform-project-update-modal__status-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.4;
        font-weight: 400;
      }

      .platform-project-update-modal__status-selector {
        width: auto;
      }

      .platform-project-update-modal__status-trigger {
        min-height: 30px;
        padding: 0;
      }

      .platform-project-update-modal__error {
        color: #f87171;
        font-size: 12px;
        line-height: 1.4;
      }

      .platform-project-update-modal__footer {
        justify-content: flex-end;
        gap: 8px;
      }

      @media (max-width: 720px) {
        .platform-project-update-card {
          padding: 16px;
        }
      }
`;
