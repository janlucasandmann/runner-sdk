import { useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "../../ui/hugeicons-compat.js";
import { PlatformDefaultWidget, joinPlatformWidgetClassNames } from "./platform-widget.js";

export interface PlatformCalendarWidgetDay {
  dateKey: string;
  weekdayLabel: string;
  dayNumber: string;
  isSelected?: boolean;
  isToday?: boolean;
  ariaLabel: string;
}

export interface PlatformCalendarWidgetItem {
  id: string;
  title: string;
  timeLabel?: string;
  kind?: string;
  [key: string]: unknown;
}

export interface PlatformCalendarWidgetView {
  selectedDate: Date;
  selectedKey: string;
  monthLabel: string;
  days: readonly PlatformCalendarWidgetDay[];
  items: readonly PlatformCalendarWidgetItem[];
}

export interface PlatformCalendarWidgetProps {
  buildView: (selectedDateKey: string) => PlatformCalendarWidgetView;
  initialDateKey?: string;
  onOpenCalendar?: () => void;
  onOpenDailyBriefingPreview?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

function toLocalDateKey(value: Date) {
  if (Number.isNaN(value.getTime())) return "";
  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
}

export function PlatformCalendarWidget({
  buildView,
  initialDateKey,
  onOpenCalendar,
  onOpenDailyBriefingPreview,
  className = "",
}: PlatformCalendarWidgetProps) {
  const [selectedDateKey, setSelectedDateKey] = useState(
    () => initialDateKey || toLocalDateKey(new Date())
  );
  const calendarView = buildView(selectedDateKey);

  function handleDateSelect(event: MouseEvent<HTMLButtonElement>, nextDateKey: string) {
    event.preventDefault();
    event.stopPropagation();
    const normalizedDateKey = String(nextDateKey || "").trim();
    if (normalizedDateKey) setSelectedDateKey(normalizedDateKey);
  }

  function handleWeekShift(event: MouseEvent<HTMLButtonElement>, dayOffset: number) {
    event.preventDefault();
    event.stopPropagation();
    const nextDate = new Date(calendarView.selectedDate);
    nextDate.setDate(nextDate.getDate() + Number(dayOffset || 0));
    setSelectedDateKey(toLocalDateKey(nextDate));
  }

  return (
    <PlatformDefaultWidget
      className={joinPlatformWidgetClassNames("playground-thread-widget-today", className)}
      aria-label="Calendar"
      data-selected-date-key={calendarView.selectedKey}
    >
      <div className="playground-thread-widget-today-header">
        <div className="playground-thread-widget-today-nav">
          <button
            type="button"
            className="playground-thread-widget-today-nav-button"
            onClick={(event) => handleWeekShift(event, -7)}
            aria-label="Previous week"
          >
            <ChevronLeft strokeWidth={1.9} />
          </button>
          <div className="playground-thread-widget-today-month">{calendarView.monthLabel}</div>
          <button
            type="button"
            className="playground-thread-widget-today-nav-button"
            onClick={(event) => handleWeekShift(event, 7)}
            aria-label="Next week"
          >
            <ChevronRight strokeWidth={1.9} />
          </button>
        </div>
        <div className="playground-thread-widget-today-week">
          {calendarView.days.map((day) => (
            <button
              key={day.dateKey}
              type="button"
              className={joinPlatformWidgetClassNames(
                "playground-thread-widget-today-day",
                day.isSelected && "is-selected",
                day.isToday && "is-today"
              )}
              data-date-key={day.dateKey}
              onClick={(event) => handleDateSelect(event, day.dateKey)}
              aria-pressed={day.isSelected ? "true" : "false"}
              aria-label={day.ariaLabel}
            >
              <span className="playground-thread-widget-today-day-weekday">
                {day.weekdayLabel}
              </span>
              <span className="playground-thread-widget-today-day-number">{day.dayNumber}</span>
            </button>
          ))}
        </div>
      </div>
      <div
        className="playground-thread-widget-today-body"
        onClick={(event) => {
          event.preventDefault();
          onOpenCalendar?.();
        }}
      >
        {calendarView.items.length ? (
          <div className="playground-thread-widget-today-events">
            {calendarView.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="playground-thread-widget-today-event"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (item.kind === "briefing") {
                    onOpenDailyBriefingPreview?.(event);
                    return;
                  }
                  onOpenCalendar?.();
                }}
              >
                <span className="playground-thread-widget-today-event-title">{item.title}</span>
                <span className="playground-thread-widget-today-event-meta">
                  {item.timeLabel ? (
                    <span className="playground-thread-widget-today-event-chip is-time">
                      {item.timeLabel}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="playground-thread-widget-today-empty">No entries for this day.</div>
        )}
      </div>
    </PlatformDefaultWidget>
  );
}
