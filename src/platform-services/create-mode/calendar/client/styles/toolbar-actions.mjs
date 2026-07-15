export const CALENDAR_TOOLBAR_ACTIONS_CSS = `
      .playground-tasks-calendar-toolbar-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }

      .playground-tasks-calendar-view-switch {
        flex: 0 0 auto;
      }

      .playground-tasks-calendar-toolbar-plus {
        flex: 0 0 auto;
      }

      .playground-tasks-calendar-nav-group {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        border: 0;
        background: transparent;
      }

      .playground-tasks-calendar-nav-button,
      .playground-tasks-calendar-today-button {
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.76);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-tasks-calendar-nav-button {
        width: 28px;
        height: 28px;
        padding: 0;
        border-radius: 999px;
      }

      .playground-tasks-calendar-today-button {
        min-height: 28px;
        padding: 0 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-tasks-calendar-nav-button:hover,
      .playground-tasks-calendar-today-button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-tasks-calendar-today-button.is-active {
        background: rgba(255, 255, 255, 0.14);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: rgba(255, 255, 255, 0.98);
      }

`;
