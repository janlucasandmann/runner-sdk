export const CALENDAR_WELCOME_WIDGET_CSS = `
      .playground-thread-widget-calendar {
        min-height: 0;
        aspect-ratio: 1 / 1;
        padding: 18px 18px 16px;
      }

      .playground-thread-widget-calendar-month {
        margin: 0 0 10px;
        color: #ff5151;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .playground-thread-widget-calendar-weekdays,
      .playground-thread-widget-calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }

      .playground-thread-widget-calendar-weekdays {
        gap: 0;
        margin-bottom: 4px;
      }

      .playground-thread-widget-calendar-weekday {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 20px;
        color: rgba(255, 255, 255, 0.78);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .playground-thread-widget-calendar-grid {
        gap: 2px 0;
      }

      .playground-thread-widget-calendar-day {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 24px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.01em;
      }

      .playground-thread-widget-calendar-day.is-empty {
        color: transparent;
      }

      .playground-thread-widget-calendar-day.is-muted {
        color: rgba(255, 255, 255, 0.44);
      }

      .playground-thread-widget-calendar-day.has-events:not(.is-today)::after {
        content: "";
        position: absolute;
        bottom: 2px;
        left: 50%;
        width: 3px;
        height: 3px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.75);
        transform: translateX(-50%);
      }

      .playground-thread-widget-calendar-day.is-today .playground-thread-widget-calendar-day-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: #ff4d57;
        color: #ffffff;
      }

      .playground-thread-widget-calendar-footer {
        margin-top: auto;
        padding-top: 8px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 10px;
        font-weight: 500;
        line-height: 1.4;
      }

`;
