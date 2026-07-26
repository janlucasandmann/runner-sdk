export const PROJECT_MILESTONES_CSS_FRAGMENT = `
      .playground-project-overview-milestones {
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-project-overview-milestones-header {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-project-overview-milestones-title {
        min-width: 0;
        margin: 0;
        color: #fff;
        font-size: 14px;
        line-height: 1.4;
        font-weight: 400;
        letter-spacing: 0;
      }

      .playground-project-overview-milestones-add.platform-button {
        flex: 0 0 auto;
      }

      .playground-project-overview-milestones-list {
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .playground-project-overview-milestone-row {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        min-height: 54px;
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr) minmax(100px, 132px) auto;
        align-items: center;
        gap: 12px;
        margin: 0;
        padding: 8px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        letter-spacing: 0;
        text-align: left;
        cursor: pointer;
        transition: background-color 140ms ease;
      }

      .playground-project-overview-milestone-row:first-child {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-milestone-row:hover,
      .playground-project-overview-milestone-row:focus-visible {
        outline: 0;
        background: rgba(255, 255, 255, 0.0375);
      }

      .playground-project-overview-milestone-icon {
        width: 24px;
        height: 24px;
        display: inline-grid;
        place-items: center;
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-project-overview-milestone-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-project-overview-milestone-name {
        min-width: 0;
        overflow: hidden;
        color: #fff;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-overview-milestone-meta {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.5);
        font-size: 10px;
        line-height: 1.4;
        font-weight: 400;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-overview-milestone-progress {
        min-width: 0;
        display: grid;
        grid-template-columns: 34px minmax(48px, 1fr);
        align-items: center;
        gap: 8px;
      }

      .playground-project-overview-milestone-progress-value {
        color: rgba(255, 255, 255, 0.56);
        font-size: 10px;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        text-align: right;
      }

      .playground-project-overview-milestone-progress-track {
        height: 3px;
        overflow: hidden;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-project-overview-milestone-progress-fill {
        height: 100%;
        display: block;
        border-radius: inherit;
        background: #4da3ff;
        transition: width 180ms ease;
      }

      .playground-project-overview-milestone-status.platform-label {
        justify-self: end;
      }

      .playground-project-overview-milestones-empty.platform-empty-state {
        min-height: 112px;
        padding: 16px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      @media (max-width: 760px) {
        .playground-project-overview-milestone-row {
          grid-template-columns: 24px minmax(0, 1fr) auto;
        }

        .playground-project-overview-milestone-progress {
          display: none;
        }
      }
`;
