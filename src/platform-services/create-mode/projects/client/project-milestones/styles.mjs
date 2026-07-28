export const PROJECT_MILESTONES_CSS_FRAGMENT = `
      .platform-project-milestones-overview-page {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-bottom: 24px;
      }

      .platform-project-milestones-overview-page__analytics {
        flex: 0 0 auto;
      }

      .platform-project-milestones-overview-page__table {
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .platform-project-milestones-overview-table {
        width: 100%;
        min-width: 0;
      }

      .platform-project-milestone-name {
        min-width: 0;
        overflow: hidden;
        color: #fff;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 400;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .platform-project-milestone-value {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.4;
        font-weight: 400;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .platform-project-milestone-progress {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        font-variant-numeric: tabular-nums;
      }

      .platform-project-milestone-progress__ring {
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

      .platform-project-milestone-progress__value {
        min-width: 32px;
      }

      .platform-project-milestones-overview-table .platform-empty-state {
        min-height: 180px;
      }

      @media (max-width: 760px) {
        .platform-project-milestones-overview-page {
          gap: 16px;
          padding-bottom: 12px;
        }
      }
`;
