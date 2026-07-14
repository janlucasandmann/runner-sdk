export const CALENDAR_STANDALONE_SURFACE_CSS = `
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar {
        padding: 0;
        gap: 0;
        overflow: hidden;
      }

      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler-main,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler-calendar-surface {
        background: transparent;
      }

      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler-main,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler-calendar-surface,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler .rbc-time-content,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler .rbc-time-view,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler .rbc-agenda-view {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler::-webkit-scrollbar,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler-main::-webkit-scrollbar,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler-calendar-surface::-webkit-scrollbar,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler .rbc-time-content::-webkit-scrollbar,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler .rbc-time-view::-webkit-scrollbar,
      .playground-environments-detail-scroll.playground-tasks-project-workspace-scroll.is-calendar .playground-tasks-scheduler .rbc-agenda-view::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

`;
