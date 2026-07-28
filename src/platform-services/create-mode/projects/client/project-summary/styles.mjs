export const PROJECT_SUMMARY_CSS_FRAGMENT = `
      .platform-project-summary-shell {
        width: 100%;
        min-width: 0;
      }

      .platform-project-summary-shell > .playground-project-overview-work-graph {
        margin-top: 24px;
      }

      .platform-project-summary {
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .platform-project-summary__icon-picker {
        flex: 0 0 auto;
      }

      .platform-project-summary__title {
        max-width: 100%;
        margin: 12px 0 0;
        overflow: hidden;
        color: #fff;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 500;
        letter-spacing: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .platform-project-summary__input {
        box-sizing: border-box;
        width: min(100%, 560px);
        min-height: 22px;
        margin: 8px 0 0;
        padding: 0;
        overflow: hidden;
        border: 0;
        border-radius: 0;
        outline: 0;
        resize: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        font: inherit;
        font-size: 14px;
        line-height: 1.55;
        font-weight: 400;
        letter-spacing: 0;
        scrollbar-width: none;
      }

      .platform-project-summary__input::-webkit-scrollbar {
        display: none;
      }

      .platform-project-summary__input::placeholder {
        color: rgba(255, 255, 255, 0.3);
        opacity: 1;
      }

      .platform-project-summary__input:disabled {
        cursor: default;
        opacity: 1;
      }

      .platform-project-summary-details {
        width: 100%;
        min-width: 0;
        margin-top: 28px;
        display: grid;
        gap: 16px;
      }

      .platform-project-summary-details__row {
        min-width: 0;
        display: grid;
        grid-template-columns: 88px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
      }

      .platform-project-summary-details__label {
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.5);
        font-family: inherit;
        font-size: 12px;
        line-height: 20px;
        font-weight: 400;
        letter-spacing: 0;
        text-align: left;
      }

      button.platform-project-summary-details__label {
        cursor: pointer;
      }

      button.platform-project-summary-details__label:hover {
        color: #fff;
      }

      .platform-project-summary-details__items {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 20px;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
      }

      .platform-project-summary-details__items::-webkit-scrollbar {
        display: none;
      }

      .platform-project-summary-details__show-all.platform-button {
        flex: 0 0 auto;
      }

      .platform-project-summary-details__item {
        min-width: 0;
        max-width: 240px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
        font: inherit;
        font-size: 12px;
        line-height: 20px;
        font-weight: 400;
        letter-spacing: 0;
        text-align: left;
      }

      button.platform-project-summary-details__item {
        cursor: pointer;
      }

      button.platform-project-summary-details__item:hover {
        color: #fff;
      }

      .platform-project-summary-details__item-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .platform-project-summary-details__resource-icon {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        display: inline-grid;
        place-items: center;
        color: rgba(255, 255, 255, 0.7);
      }

      .platform-project-summary-details__resource-icon > *,
      .platform-project-summary-details__resource-icon .playground-project-resource-title-icon {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
      }

      .platform-project-summary-details__resource-icon img {
        width: 18px;
        height: 18px;
        object-fit: cover;
      }

      .platform-project-summary-details__milestone-ring {
        box-sizing: border-box;
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        border-radius: 50%;
        background:
          radial-gradient(circle at center, #000 52%, transparent 54%),
          conic-gradient(
            #636bdc 0 var(--project-milestone-progress, 0%),
            rgba(255, 255, 255, 0.12) var(--project-milestone-progress, 0%) 100%
          );
      }

      .platform-project-summary-details__loading,
      .platform-project-summary-details__empty {
        min-height: 20px;
        display: inline-flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.3);
        font-size: 12px;
        line-height: 20px;
        font-weight: 400;
        letter-spacing: 0;
      }

      @media (max-width: 720px) {
        .platform-project-summary-details__row {
          grid-template-columns: 72px minmax(0, 1fr);
          gap: 8px;
        }
      }
`;
