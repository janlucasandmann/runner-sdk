export const CALENDAR_LEGACY_GRID_CSS = `
      .playground-tasks-calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 10px;
      }

      .playground-tasks-calendar-day {
        min-height: 220px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.03);
      }

      .playground-tasks-calendar-day-header {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-tasks-calendar-day-label {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-tasks-calendar-day-date {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.44);
      }

      .playground-tasks-calendar-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-tasks-calendar-entry {
        gap: 6px;
        padding: 10px 12px;
        border-radius: 14px;
      }

      .playground-tasks-calendar-entry-time {
        font-size: 11px;
        font-weight: 600;
        color: rgba(138, 214, 255, 0.88);
      }

`;
