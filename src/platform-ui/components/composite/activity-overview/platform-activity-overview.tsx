import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  Check,
  CircleAlert,
  Flag,
  GitBranch,
  Workflow,
  X,
} from "lucide-react";

import { PlatformEmptyState } from "../empty-state/index.js";
import { PlatformLoadingState } from "../loading-state/index.js";

export type PlatformActivityOverviewItemKind =
  | "activity"
  | "signal"
  | "subflow";

export type PlatformActivityOverviewItemStatus =
  | "default"
  | "running"
  | "success"
  | "error";

export type PlatformActivityOverviewTimestamp =
  | Date
  | number
  | string;

export interface PlatformActivityOverviewItem {
  id: string;
  label: ReactNode;
  content?: ReactNode;
  startAt: PlatformActivityOverviewTimestamp;
  endAt?: PlatformActivityOverviewTimestamp | null;
  kind?: PlatformActivityOverviewItemKind;
  status?: PlatformActivityOverviewItemStatus;
  metadata?: ReactNode;
  icon?: ElementType;
  color?: string;
  ariaLabel?: string;
  onActivate?: () => void;
}

export interface PlatformActivityOverviewTimeRange {
  startAt: number;
  endAt: number;
  startPercent: number;
  endPercent: number;
}

export interface PlatformActivityOverviewProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  items?: readonly PlatformActivityOverviewItem[];
  loading?: boolean;
  loadingMessage?: ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyIcon?: ElementType;
  minTimelineWidth?: number;
  timelineLayout?: "fit" | "scroll";
  tickCount?: number;
  ariaLabel?: string;
  minimumRangePercent?: number;
  onTimeRangeChange?: (range: PlatformActivityOverviewTimeRange) => void;
  resizable?: boolean;
  minResizeHeight?: number;
  maxResizeHeight?: number;
  minSiblingHeight?: number;
  onHeightChange?: (height: number) => void;
  headerActions?: ReactNode;
}

interface NormalizedActivityOverviewItem
  extends PlatformActivityOverviewItem {
  startTime: number;
  endTime: number;
  kind: PlatformActivityOverviewItemKind;
  status: PlatformActivityOverviewItemStatus;
  leftPercent: number;
  widthPercent: number;
  rowIndex: number;
}

interface TimeRangeWindow {
  start: number;
  end: number;
}

interface TimeRangeDrag {
  pointerId: number;
  mode: "start" | "end" | "window";
  startClientX: number;
  startPercent: number;
  endPercent: number;
  trackWidth: number;
}

interface HeightResizeDrag {
  pointerId: number;
  startClientY: number;
  startHeight: number;
  minHeight: number;
  maxHeight: number;
}

const DEFAULT_MIN_TIMELINE_WIDTH = 1480;
const DEFAULT_TICK_COUNT = 6;
const DEFAULT_MINIMUM_RANGE_PERCENT = 2;
const DEFAULT_RESIZE_HEIGHT = 460;
const DEFAULT_MIN_RESIZE_HEIGHT = 240;
const DEFAULT_MIN_SIBLING_HEIGHT = 220;
const ROW_HEIGHT = 58;
const PLOT_TOP_PADDING = 18;
const PLOT_BOTTOM_PADDING = 22;

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readTimestamp(value: PlatformActivityOverviewTimestamp | null | undefined) {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function formatPlatformActivityOverviewDuration(durationMs: number) {
  const duration = Math.max(0, durationMs);
  if (duration < 1_000) {
    return `${Math.max(1, Math.round(duration))} ms`;
  }
  if (duration < 60_000) {
    const seconds = duration / 1_000;
    return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)} s`;
  }
  if (duration < 3_600_000) {
    return `${Math.max(1, Math.round(duration / 60_000))} min`;
  }
  if (duration < 86_400_000) {
    return `${Math.max(1, Math.round(duration / 3_600_000))} h`;
  }
  return `${Math.max(1, Math.round(duration / 86_400_000))} d`;
}

function formatTickLabel(
  timestamp: number,
  domainStart: number,
  domainEnd: number,
  index: number,
) {
  if (index === 0) {
    return "START";
  }

  const range = Math.max(1, domainEnd - domainStart);
  const elapsed = Math.max(0, timestamp - domainStart);
  if (range <= 60_000) {
    return formatPlatformActivityOverviewDuration(elapsed);
  }
  if (range <= 86_400_000) {
    const hours = Math.floor(elapsed / 3_600_000);
    const minutes = Math.round((elapsed % 3_600_000) / 60_000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(1, minutes)}m`;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

function resolveItemIcon(item: NormalizedActivityOverviewItem) {
  if (item.icon) {
    return item.icon;
  }
  if (item.kind === "subflow") {
    return GitBranch;
  }
  return Flag;
}

function resolveStatusIcon(status: PlatformActivityOverviewItemStatus) {
  if (status === "success") {
    return Check;
  }
  if (status === "error") {
    return X;
  }
  if (status === "running") {
    return CircleAlert;
  }
  return null;
}

function buildDomain(items: readonly PlatformActivityOverviewItem[]) {
  const startTimestamps: number[] = [];
  items.forEach((item) => {
    const startTime = readTimestamp(item.startAt);
    if (startTime !== null) {
      startTimestamps.push(startTime);
    }
  });

  if (startTimestamps.length === 0) {
    const now = Date.now();
    return {
      start: now,
      end: now + 1_000,
    };
  }

  const minimum = Math.min(...startTimestamps);
  const maximum = Math.max(...startTimestamps);
  const rawRange = maximum - minimum;
  return {
    start: minimum,
    end: rawRange > 0 ? maximum : minimum + 1_000,
  };
}

function itemIntersectsTimeRange(
  item: PlatformActivityOverviewItem,
  rangeStart: number,
  rangeEnd: number,
) {
  const startTime = readTimestamp(item.startAt);
  if (startTime === null) {
    return false;
  }
  const requestedEndTime = readTimestamp(item.endAt);
  const endTime = Math.max(startTime, requestedEndTime ?? startTime);
  return startTime <= rangeEnd && endTime >= rangeStart;
}

function normalizeItems(
  items: readonly PlatformActivityOverviewItem[],
  domainStart: number,
  domainEnd: number,
) {
  const domainRange = Math.max(1, domainEnd - domainStart);
  return items
    .map((item) => {
      const startTime = readTimestamp(item.startAt);
      if (startTime === null) {
        return null;
      }
      const requestedEndTime = readTimestamp(item.endAt);
      const endTime = Math.max(startTime, requestedEndTime ?? startTime);
      return {
        ...item,
        startTime,
        endTime,
        kind: item.kind || "activity",
        status: item.status || "default",
      };
    })
    .filter(
      (
        item,
      ): item is Omit<
        NormalizedActivityOverviewItem,
        "leftPercent" | "widthPercent" | "rowIndex"
      > => Boolean(item),
    )
    .sort(
      (left, right) =>
        left.startTime - right.startTime ||
        left.endTime - right.endTime ||
        left.id.localeCompare(right.id),
    )
    .map((item, rowIndex) => ({
      ...item,
      leftPercent: clamp(
        ((item.startTime - domainStart) / domainRange) * 100,
        0,
        100,
      ),
      widthPercent: clamp(
        ((item.endTime - item.startTime) / domainRange) * 100,
        0,
        100,
      ),
      rowIndex,
    }));
}

function buildTicks(
  tickCount: number,
  domainStart: number,
  domainEnd: number,
) {
  return Array.from({ length: tickCount }, (_, index) => {
    const progress = index / (tickCount - 1);
    const timestamp = domainStart + (domainEnd - domainStart) * progress;
    return {
      id: `${index}:${timestamp}`,
      progress,
      label: formatTickLabel(
        timestamp,
        domainStart,
        domainEnd,
        index,
      ),
    };
  });
}

function formatRangeValue(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function ActivityOverviewItem({
  item,
  topPadding,
}: {
  item: NormalizedActivityOverviewItem;
  topPadding: number;
}) {
  const ItemIcon = resolveItemIcon(item);
  const StatusIcon = resolveStatusIcon(item.status);
  const interactive = typeof item.onActivate === "function";
  const defaultMetadata =
    item.endTime > item.startTime
      ? formatPlatformActivityOverviewDuration(item.endTime - item.startTime)
      : null;
  const itemStyle = {
    "--platform-activity-overview-item-left": `${item.leftPercent}%`,
    "--platform-activity-overview-item-width": `${item.widthPercent}%`,
    "--platform-activity-overview-item-color": item.color || undefined,
  } as CSSProperties;

  if (item.content !== undefined && item.content !== null) {
    return (
      <div
        className={joinClassNames(
          "platform-activity-overview__row",
          "has-custom-content",
          `is-${item.kind}`,
          `is-${item.status}`,
        )}
        style={{
          top: `${topPadding + item.rowIndex * ROW_HEIGHT}px`,
        }}
        role="listitem"
      >
        <div
          className="platform-activity-overview__custom-item"
          style={itemStyle}
        >
          {item.content}
        </div>
      </div>
    );
  }

  if (item.kind === "signal") {
    const signalContent = (
      <>
        <span
          className="platform-activity-overview__signal-mark"
          aria-hidden="true"
        />
        <span className="platform-activity-overview__signal-label">
          {item.label}
        </span>
      </>
    );
    return (
      <div
        className={joinClassNames(
          "platform-activity-overview__row",
          "is-signal",
          `is-${item.status}`,
        )}
        style={{
          top: `${topPadding + item.rowIndex * ROW_HEIGHT}px`,
        }}
        role="listitem"
      >
        {interactive ? (
          <button
            type="button"
            className="platform-activity-overview__signal"
            style={itemStyle}
            aria-label={item.ariaLabel}
            onClick={item.onActivate}
          >
            {signalContent}
          </button>
        ) : (
          <div
            className="platform-activity-overview__signal"
            style={itemStyle}
          >
            {signalContent}
          </div>
        )}
      </div>
    );
  }

  const content = (
    <>
      <span
        className="platform-activity-overview__item-icon"
        aria-hidden="true"
      >
        <ItemIcon width={14} height={14} strokeWidth={1.8} />
      </span>
      <span className="platform-activity-overview__item-label">
        {item.label}
      </span>
      {item.metadata || defaultMetadata ? (
        <span className="platform-activity-overview__item-metadata">
          {item.metadata || defaultMetadata}
        </span>
      ) : null}
      {StatusIcon ? (
        <StatusIcon
          className="platform-activity-overview__item-status"
          width={13}
          height={13}
          strokeWidth={2}
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  return (
    <div
      className={joinClassNames(
        "platform-activity-overview__row",
        `is-${item.kind}`,
        `is-${item.status}`,
      )}
      style={{
        top: `${topPadding + item.rowIndex * ROW_HEIGHT}px`,
      }}
      role="listitem"
    >
      {interactive ? (
        <button
          type="button"
          className="platform-activity-overview__item"
          style={itemStyle}
          aria-label={item.ariaLabel}
          onClick={item.onActivate}
        >
          {content}
        </button>
      ) : (
        <div
          className="platform-activity-overview__item"
          style={itemStyle}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export function PlatformActivityOverview({
  items = [],
  loading = false,
  loadingMessage = "Loading activity...",
  emptyTitle = "No activity yet",
  emptyDescription = "Work on this resource will appear here over time.",
  emptyIcon = Workflow,
  minTimelineWidth = DEFAULT_MIN_TIMELINE_WIDTH,
  timelineLayout = "fit",
  tickCount = DEFAULT_TICK_COUNT,
  ariaLabel = "Activity over time",
  minimumRangePercent = DEFAULT_MINIMUM_RANGE_PERCENT,
  onTimeRangeChange,
  resizable = false,
  minResizeHeight = DEFAULT_MIN_RESIZE_HEIGHT,
  maxResizeHeight,
  minSiblingHeight = DEFAULT_MIN_SIBLING_HEIGHT,
  onHeightChange,
  headerActions = null,
  className = "",
  style,
  ...props
}: PlatformActivityOverviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const timeRangeDragRef = useRef<TimeRangeDrag | null>(null);
  const heightResizeDragRef = useRef<HeightResizeDrag | null>(null);
  const onTimeRangeChangeRef = useRef(onTimeRangeChange);
  const [timeRangeWindow, setTimeRangeWindow] = useState<TimeRangeWindow>({
    start: 0,
    end: 100,
  });
  const [internalHeight, setInternalHeight] = useState<number | null>(null);
  const domain = useMemo(() => buildDomain(items), [items]);
  const domainRange = Math.max(1, domain.end - domain.start);
  const normalizedMinimumRangePercent = clamp(
    Number(minimumRangePercent) || DEFAULT_MINIMUM_RANGE_PERCENT,
    0.5,
    50,
  );
  const visibleTimeRange = useMemo<PlatformActivityOverviewTimeRange>(
    () => ({
      startAt:
        domain.start + domainRange * (timeRangeWindow.start / 100),
      endAt: domain.start + domainRange * (timeRangeWindow.end / 100),
      startPercent: timeRangeWindow.start,
      endPercent: timeRangeWindow.end,
    }),
    [
      domain.start,
      domainRange,
      timeRangeWindow.end,
      timeRangeWindow.start,
    ],
  );
  const minimapItems = useMemo(
    () => normalizeItems(items, domain.start, domain.end),
    [domain.end, domain.start, items],
  );
  const visibleItems = useMemo(
    () =>
      items.filter((item) =>
        itemIntersectsTimeRange(
          item,
          visibleTimeRange.startAt,
          visibleTimeRange.endAt,
        ),
      ),
    [items, visibleTimeRange.endAt, visibleTimeRange.startAt],
  );
  const normalizedItems = useMemo(
    () =>
      normalizeItems(
        visibleItems,
        visibleTimeRange.startAt,
        visibleTimeRange.endAt,
      ),
    [visibleItems, visibleTimeRange.endAt, visibleTimeRange.startAt],
  );
  const normalizedTickCount = Math.max(2, Math.floor(tickCount));
  const ticks = useMemo(
    () =>
      buildTicks(
        normalizedTickCount,
        visibleTimeRange.startAt,
        visibleTimeRange.endAt,
      ),
    [
      normalizedTickCount,
      visibleTimeRange.endAt,
      visibleTimeRange.startAt,
    ],
  );
  const navigatorTicks = useMemo(
    () => buildTicks(normalizedTickCount, domain.start, domain.end),
    [domain.end, domain.start, normalizedTickCount],
  );
  const plotTopPadding = headerActions ? 58 : PLOT_TOP_PADDING;
  const plotHeight = Math.max(
    240,
    plotTopPadding +
      normalizedItems.length * ROW_HEIGHT +
      PLOT_BOTTOM_PADDING,
  );
  const fitTimeline = timelineLayout !== "scroll";
  const timelineStyle = {
    width: "100%",
    maxWidth: "100%",
    minWidth: fitTimeline
      ? "0"
      : `${Math.max(720, minTimelineWidth)}px`,
    height: `${plotHeight}px`,
  } as CSSProperties;

  useEffect(() => {
    onTimeRangeChangeRef.current = onTimeRangeChange;
  }, [onTimeRangeChange]);

  useEffect(() => {
    onTimeRangeChangeRef.current?.(visibleTimeRange);
  }, [visibleTimeRange]);

  const commitTimeRange = useCallback(
    (
      requestedStart: number,
      requestedEnd: number,
      anchor: TimeRangeDrag["mode"] = "window",
    ) => {
      setTimeRangeWindow((current) => {
        let nextStart = current.start;
        let nextEnd = current.end;
        if (anchor === "start") {
          nextStart = clamp(
            requestedStart,
            0,
            current.end - normalizedMinimumRangePercent,
          );
        } else if (anchor === "end") {
          nextEnd = clamp(
            requestedEnd,
            current.start + normalizedMinimumRangePercent,
            100,
          );
        } else {
          const requestedWidth = clamp(
            requestedEnd - requestedStart,
            normalizedMinimumRangePercent,
            100,
          );
          nextStart = clamp(requestedStart, 0, 100 - requestedWidth);
          nextEnd = nextStart + requestedWidth;
        }
        return Math.abs(current.start - nextStart) < 0.001 &&
          Math.abs(current.end - nextEnd) < 0.001
          ? current
          : { start: nextStart, end: nextEnd };
      });
    },
    [normalizedMinimumRangePercent],
  );

  function handleMinimapPointerDown(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (event.button !== 0) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0) {
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    const handle = target?.closest<HTMLElement>(
      "[data-activity-range-handle]",
    );
    const rangeWindow = target?.closest<HTMLElement>(
      "[data-activity-range-window]",
    );
    let nextWindow = timeRangeWindow;
    let mode: TimeRangeDrag["mode"] = "window";

    if (handle?.dataset.activityRangeHandle === "start") {
      mode = "start";
    } else if (handle?.dataset.activityRangeHandle === "end") {
      mode = "end";
    } else if (!rangeWindow) {
      const pointerPercent = clamp(
        ((event.clientX - bounds.left) / bounds.width) * 100,
        0,
        100,
      );
      const currentWidth = timeRangeWindow.end - timeRangeWindow.start;
      const nextStart = clamp(
        pointerPercent - currentWidth / 2,
        0,
        100 - currentWidth,
      );
      nextWindow = {
        start: nextStart,
        end: nextStart + currentWidth,
      };
      commitTimeRange(nextWindow.start, nextWindow.end);
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    timeRangeDragRef.current = {
      pointerId: event.pointerId,
      mode,
      startClientX: event.clientX,
      startPercent: nextWindow.start,
      endPercent: nextWindow.end,
      trackWidth: bounds.width,
    };
  }

  function handleMinimapPointerMove(
    event: PointerEvent<HTMLDivElement>,
  ) {
    const drag = timeRangeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    const deltaPercent =
      ((event.clientX - drag.startClientX) / drag.trackWidth) * 100;
    if (drag.mode === "start") {
      commitTimeRange(
        drag.startPercent + deltaPercent,
        drag.endPercent,
        "start",
      );
      return;
    }
    if (drag.mode === "end") {
      commitTimeRange(
        drag.startPercent,
        drag.endPercent + deltaPercent,
        "end",
      );
      return;
    }
    const width = drag.endPercent - drag.startPercent;
    const nextStart = clamp(
      drag.startPercent + deltaPercent,
      0,
      100 - width,
    );
    commitTimeRange(nextStart, nextStart + width);
  }

  function handleMinimapPointerEnd(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (timeRangeDragRef.current?.pointerId !== event.pointerId) {
      return;
    }
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    timeRangeDragRef.current = null;
  }

  function handleRangeHandleKeyDown(
    side: "start" | "end",
    event: KeyboardEvent<HTMLElement>,
  ) {
    const direction =
      event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowRight"
          ? 1
          : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") {
      return;
    }
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    if (side === "start") {
      const nextStart =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? timeRangeWindow.end - normalizedMinimumRangePercent
            : timeRangeWindow.start + direction * step;
      commitTimeRange(nextStart, timeRangeWindow.end, "start");
      return;
    }
    const nextEnd =
      event.key === "End"
        ? 100
        : event.key === "Home"
          ? timeRangeWindow.start + normalizedMinimumRangePercent
          : timeRangeWindow.end + direction * step;
    commitTimeRange(timeRangeWindow.start, nextEnd, "end");
  }

  const commitHeight = useCallback(
    (height: number) => {
      const roundedHeight = Math.round(height);
      if (!Number.isFinite(roundedHeight)) {
        return;
      }
      setInternalHeight(roundedHeight);
      onHeightChange?.(roundedHeight);
    },
    [onHeightChange],
  );

  function resolveHeightResizeBounds() {
    const section = sectionRef.current;
    const parentHeight =
      section?.parentElement?.getBoundingClientRect().height || 0;
    const normalizedMinHeight = Math.max(
      160,
      Number(minResizeHeight) || DEFAULT_MIN_RESIZE_HEIGHT,
    );
    const availableMaxHeight =
      parentHeight > 0
        ? Math.max(
            normalizedMinHeight,
            parentHeight -
              Math.max(
                120,
                Number(minSiblingHeight) || DEFAULT_MIN_SIBLING_HEIGHT,
              ),
          )
        : Number.POSITIVE_INFINITY;
    const configuredMaxHeight = Number(maxResizeHeight);
    const normalizedMaxHeight = Number.isFinite(configuredMaxHeight)
      ? Math.max(normalizedMinHeight, configuredMaxHeight)
      : availableMaxHeight;
    return {
      minHeight: normalizedMinHeight,
      maxHeight: Math.min(availableMaxHeight, normalizedMaxHeight),
    };
  }

  function handleResizePointerDown(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (event.button !== 0 || !sectionRef.current) {
      return;
    }
    const bounds = resolveHeightResizeBounds();
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    heightResizeDragRef.current = {
      pointerId: event.pointerId,
      startClientY: event.clientY,
      startHeight: sectionRef.current.getBoundingClientRect().height,
      ...bounds,
    };
  }

  function handleResizePointerMove(
    event: PointerEvent<HTMLDivElement>,
  ) {
    const drag = heightResizeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    commitHeight(
      clamp(
        drag.startHeight + event.clientY - drag.startClientY,
        drag.minHeight,
        drag.maxHeight,
      ),
    );
  }

  function handleResizePointerEnd(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (heightResizeDragRef.current?.pointerId !== event.pointerId) {
      return;
    }
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    heightResizeDragRef.current = null;
  }

  function handleResizeKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    event.preventDefault();
    const bounds = resolveHeightResizeBounds();
    const direction = event.key === "ArrowUp" ? -1 : 1;
    const step = event.shiftKey ? 40 : 12;
    commitHeight(
      clamp(
        section.getBoundingClientRect().height + direction * step,
        bounds.minHeight,
        bounds.maxHeight,
      ),
    );
  }

  const sectionStyle = {
    ...style,
    ...(internalHeight !== null
      ? {
          height: `${internalHeight}px`,
          minHeight: `${Math.min(internalHeight, minResizeHeight)}px`,
          maxHeight: "100%",
        }
      : null),
  } as CSSProperties;

  if (loading) {
    return (
      <section
        {...props}
        ref={sectionRef}
        style={sectionStyle}
        className={joinClassNames(
          "platform-activity-overview",
          "is-loading",
          className,
        )}
        aria-label={ariaLabel}
      >
        {headerActions ? (
          <div className="platform-activity-overview__header-actions">
            {headerActions}
          </div>
        ) : null}
        <PlatformLoadingState
          className="platform-activity-overview__loading"
          message={loadingMessage}
          centered
        />
      </section>
    );
  }

  if (minimapItems.length === 0) {
    return (
      <section
        {...props}
        ref={sectionRef}
        style={sectionStyle}
        className={joinClassNames(
          "platform-activity-overview",
          "is-empty",
          className,
        )}
        aria-label={ariaLabel}
      >
        {headerActions ? (
          <div className="platform-activity-overview__header-actions">
            {headerActions}
          </div>
        ) : null}
        <PlatformEmptyState
          className="platform-activity-overview__empty"
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </section>
    );
  }

  return (
    <section
      {...props}
      ref={sectionRef}
      style={sectionStyle}
      className={joinClassNames(
        "platform-activity-overview",
        fitTimeline && "is-fit-timeline",
        resizable && "is-resizable",
        className,
      )}
      aria-label={ariaLabel}
    >
      {headerActions ? (
        <div className="platform-activity-overview__header-actions">
          {headerActions}
        </div>
      ) : null}
      <div className="platform-activity-overview__viewport">
        <div
          className="platform-activity-overview__timeline"
          style={timelineStyle}
        >
          <div
            className="platform-activity-overview__plot"
            style={{ height: `${plotHeight}px` }}
            role="list"
          >
            <div
              className="platform-activity-overview__grid"
              aria-hidden="true"
            >
              {ticks.map((tick) => (
                <span
                  key={tick.id}
                  className="platform-activity-overview__grid-line"
                  style={{ left: `${tick.progress * 100}%` }}
                />
              ))}
            </div>

            {normalizedItems.map((item) => (
              <ActivityOverviewItem
                key={item.id}
                item={item}
                topPadding={plotTopPadding}
              />
            ))}
            {normalizedItems.length === 0 ? (
              <PlatformEmptyState
                className="platform-activity-overview__range-empty"
                icon={emptyIcon}
                title="No activity in this time range"
                description="Expand or move the selected range to show activity."
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="platform-activity-overview__navigator">
        <div
          ref={minimapRef}
          className="platform-activity-overview__minimap"
          role="group"
          aria-label="Filter activity timeline by time range"
          onPointerDown={handleMinimapPointerDown}
          onPointerMove={handleMinimapPointerMove}
          onPointerUp={handleMinimapPointerEnd}
          onPointerCancel={handleMinimapPointerEnd}
          onLostPointerCapture={handleMinimapPointerEnd}
        >
          <div
            className="platform-activity-overview__minimap-bars"
            aria-hidden="true"
          >
            {minimapItems.map((item) => (
              <span
                key={item.id}
                className={joinClassNames(
                  "platform-activity-overview__minimap-bar",
                  `is-${item.kind}`,
                  `is-${item.status}`,
                )}
                style={{ left: `${item.leftPercent}%` }}
              />
            ))}
          </div>
          <div
            className="platform-activity-overview__minimap-window"
            data-activity-range-window="true"
            style={{
              left: `${timeRangeWindow.start}%`,
              width: `${timeRangeWindow.end - timeRangeWindow.start}%`,
            }}
          >
            <span
              className="platform-activity-overview__minimap-handle is-start"
              data-activity-range-handle="start"
              role="slider"
              aria-label="Activity range start"
              aria-valuemin={0}
              aria-valuemax={Math.round(
                timeRangeWindow.end - normalizedMinimumRangePercent,
              )}
              aria-valuenow={Math.round(timeRangeWindow.start)}
              aria-valuetext={formatRangeValue(visibleTimeRange.startAt)}
              aria-orientation="horizontal"
              tabIndex={0}
              onKeyDown={(event) =>
                handleRangeHandleKeyDown("start", event)
              }
            />
            <span
              className="platform-activity-overview__minimap-handle is-end"
              data-activity-range-handle="end"
              role="slider"
              aria-label="Activity range end"
              aria-valuemin={Math.round(
                timeRangeWindow.start + normalizedMinimumRangePercent,
              )}
              aria-valuemax={100}
              aria-valuenow={Math.round(timeRangeWindow.end)}
              aria-valuetext={formatRangeValue(visibleTimeRange.endAt)}
              aria-orientation="horizontal"
              tabIndex={0}
              onKeyDown={(event) =>
                handleRangeHandleKeyDown("end", event)
              }
            />
          </div>
        </div>

        <div
          className="platform-activity-overview__axis"
          aria-hidden="true"
        >
          {navigatorTicks.map((tick) => (
            <span
              key={tick.id}
              className="platform-activity-overview__tick"
              style={{ left: `${tick.progress * 100}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>
      {resizable ? (
        <div
          className="platform-activity-overview__resize-handle"
          role="separator"
          aria-label="Resize activity chart"
          aria-orientation="horizontal"
          aria-valuemin={Math.max(160, minResizeHeight)}
          aria-valuemax={
            Number.isFinite(Number(maxResizeHeight))
              ? Math.max(minResizeHeight, Number(maxResizeHeight))
              : 2_000
          }
          aria-valuenow={Math.round(
            internalHeight ?? DEFAULT_RESIZE_HEIGHT,
          )}
          tabIndex={0}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerEnd}
          onPointerCancel={handleResizePointerEnd}
          onLostPointerCapture={handleResizePointerEnd}
          onKeyDown={handleResizeKeyDown}
        />
      ) : null}
    </section>
  );
}
