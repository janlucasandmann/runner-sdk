import {
  useCallback,
  useLayoutEffect,
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

export interface PlatformActivityOverviewProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  items?: readonly PlatformActivityOverviewItem[];
  loading?: boolean;
  loadingMessage?: ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyIcon?: ElementType;
  minTimelineWidth?: number;
  tickCount?: number;
  ariaLabel?: string;
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

interface ViewportWindow {
  left: number;
  width: number;
}

const DEFAULT_MIN_TIMELINE_WIDTH = 1480;
const DEFAULT_TICK_COUNT = 6;
const ROW_HEIGHT = 58;
const PLOT_TOP_PADDING = 18;
const PLOT_BOTTOM_PADDING = 22;
const AXIS_HEIGHT = 34;

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
  const timestamps: number[] = [];
  items.forEach((item) => {
    const startTime = readTimestamp(item.startAt);
    const endTime = readTimestamp(item.endAt);
    if (startTime !== null) {
      timestamps.push(startTime);
    }
    if (endTime !== null) {
      timestamps.push(endTime);
    }
  });

  if (timestamps.length === 0) {
    const now = Date.now();
    return {
      start: now,
      end: now + 1_000,
    };
  }

  const minimum = Math.min(...timestamps);
  const maximum = Math.max(...timestamps);
  const rawRange = Math.max(1, maximum - minimum);
  const fallbackRange = rawRange <= 1 ? 1_000 : rawRange;
  const padding = Math.max(1, fallbackRange * 0.035);
  return {
    start: minimum - padding,
    end: maximum + padding,
  };
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

function ActivityOverviewItem({
  item,
}: {
  item: NormalizedActivityOverviewItem;
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
          top: `${PLOT_TOP_PADDING + item.rowIndex * ROW_HEIGHT}px`,
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
        top: `${PLOT_TOP_PADDING + item.rowIndex * ROW_HEIGHT}px`,
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
  tickCount = DEFAULT_TICK_COUNT,
  ariaLabel = "Activity over time",
  className = "",
  ...props
}: PlatformActivityOverviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [viewportWindow, setViewportWindow] = useState<ViewportWindow>({
    left: 0,
    width: 100,
  });
  const domain = useMemo(() => buildDomain(items), [items]);
  const normalizedItems = useMemo(
    () => normalizeItems(items, domain.start, domain.end),
    [domain.end, domain.start, items],
  );
  const normalizedTickCount = Math.max(2, Math.floor(tickCount));
  const ticks = useMemo(
    () =>
      Array.from({ length: normalizedTickCount }, (_, index) => {
        const progress = index / (normalizedTickCount - 1);
        const timestamp =
          domain.start + (domain.end - domain.start) * progress;
        return {
          id: `${index}:${timestamp}`,
          progress,
          label: formatTickLabel(
            timestamp,
            domain.start,
            domain.end,
            index,
          ),
        };
      }),
    [domain.end, domain.start, normalizedTickCount],
  );
  const plotHeight = Math.max(
    240,
    PLOT_TOP_PADDING +
      normalizedItems.length * ROW_HEIGHT +
      PLOT_BOTTOM_PADDING,
  );
  const timelineStyle = {
    minWidth: `${Math.max(720, minTimelineWidth)}px`,
    height: `${plotHeight + AXIS_HEIGHT}px`,
  } as CSSProperties;

  const syncViewportWindow = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const scrollWidth = Math.max(1, viewport.scrollWidth);
    const clientWidth = Math.max(0, viewport.clientWidth);
    const nextWidth = clamp((clientWidth / scrollWidth) * 100, 0, 100);
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
    const nextLeft =
      maxScrollLeft > 0
        ? clamp((viewport.scrollLeft / scrollWidth) * 100, 0, 100 - nextWidth)
        : 0;
    setViewportWindow((current) =>
      Math.abs(current.left - nextLeft) < 0.05 &&
      Math.abs(current.width - nextWidth) < 0.05
        ? current
        : { left: nextLeft, width: nextWidth },
    );
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || loading || normalizedItems.length === 0) {
      return undefined;
    }
    syncViewportWindow();
    viewport.addEventListener("scroll", syncViewportWindow, {
      passive: true,
    });
    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(syncViewportWindow)
        : null;
    resizeObserver?.observe(viewport);
    window.addEventListener("resize", syncViewportWindow);
    return () => {
      viewport.removeEventListener("scroll", syncViewportWindow);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncViewportWindow);
    };
  }, [loading, normalizedItems.length, syncViewportWindow]);

  const updateViewportFromMinimap = useCallback(
    (clientX: number) => {
      const minimap = minimapRef.current;
      const viewport = viewportRef.current;
      if (!minimap || !viewport) {
        return;
      }
      const bounds = minimap.getBoundingClientRect();
      if (bounds.width <= 0) {
        return;
      }
      const ratio = clamp((clientX - bounds.left) / bounds.width, 0, 1);
      const maxScrollLeft = Math.max(
        0,
        viewport.scrollWidth - viewport.clientWidth,
      );
      viewport.scrollLeft = clamp(
        ratio * viewport.scrollWidth - viewport.clientWidth / 2,
        0,
        maxScrollLeft,
      );
      syncViewportWindow();
    },
    [syncViewportWindow],
  );

  function handleMinimapPointer(
    event: PointerEvent<HTMLDivElement>,
  ) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateViewportFromMinimap(event.clientX);
  }

  function handleMinimapKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    event.preventDefault();
    viewport.scrollLeft += event.key === "ArrowLeft" ? -120 : 120;
    syncViewportWindow();
  }

  if (loading) {
    return (
      <section
        {...props}
        className={joinClassNames(
          "platform-activity-overview",
          "is-loading",
          className,
        )}
        aria-label={ariaLabel}
      >
        <PlatformLoadingState
          className="platform-activity-overview__loading"
          message={loadingMessage}
          centered
        />
      </section>
    );
  }

  if (normalizedItems.length === 0) {
    return (
      <section
        {...props}
        className={joinClassNames(
          "platform-activity-overview",
          "is-empty",
          className,
        )}
        aria-label={ariaLabel}
      >
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
      className={joinClassNames("platform-activity-overview", className)}
      aria-label={ariaLabel}
    >
      <div
        ref={viewportRef}
        className="platform-activity-overview__viewport"
      >
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
              <ActivityOverviewItem key={item.id} item={item} />
            ))}
          </div>

          <div
            className="platform-activity-overview__axis"
            aria-hidden="true"
          >
            {ticks.map((tick) => (
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
      </div>

      <div
        ref={minimapRef}
        className="platform-activity-overview__minimap"
        role="scrollbar"
        aria-label="Navigate activity timeline"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(viewportWindow.left)}
        tabIndex={0}
        onPointerDown={handleMinimapPointer}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            updateViewportFromMinimap(event.clientX);
          }
        }}
        onKeyDown={handleMinimapKeyDown}
      >
        <div
          className="platform-activity-overview__minimap-bars"
          aria-hidden="true"
        >
          {normalizedItems.map((item) => (
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
        <span
          className="platform-activity-overview__minimap-window"
          style={{
            left: `${viewportWindow.left}%`,
            width: `${viewportWindow.width}%`,
          }}
          aria-hidden="true"
        >
          <span className="platform-activity-overview__minimap-handle is-start" />
          <span className="platform-activity-overview__minimap-handle is-end" />
        </span>
      </div>
    </section>
  );
}
