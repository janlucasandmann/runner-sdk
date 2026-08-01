import type { CSSProperties, HTMLAttributes } from "react";

import {
  PlatformActivityOverview,
  type PlatformActivityOverviewProps,
} from "../activity-overview/index.js";
import {
  PlatformActivityTimeline,
  type PlatformActivityTimelineProps,
} from "../activity-timeline/index.js";
import { PlatformLoadingState } from "../loading-state/index.js";

export interface PlatformActivityWorkspaceProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  overviewProps: PlatformActivityOverviewProps;
  timelineProps: PlatformActivityTimelineProps;
  timelineLoading?: boolean;
  timelineLoadingMessage?: string;
  timelineLoadingClassName?: string;
  chartHeight?: number | null;
  minimumTimelineHeight?: number;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function buildWorkspaceStyle(
  style: CSSProperties | undefined,
  chartHeight: number | null | undefined,
  minimumTimelineHeight: number,
): CSSProperties | undefined {
  if (!Number.isFinite(chartHeight) || Number(chartHeight) <= 0) {
    return style;
  }
  const normalizedChartHeight = Math.max(240, Number(chartHeight));
  const normalizedTimelineHeight = Math.max(180, minimumTimelineHeight);
  return {
    ...style,
    gridTemplateRows: `min(${normalizedChartHeight}px, calc(100% - ${normalizedTimelineHeight}px)) minmax(${normalizedTimelineHeight}px, 1fr)`,
  };
}

/**
 * Shared page-level composition for activity overview charts and their
 * inspectable event timelines. Resource-specific adapters only supply data.
 */
export function PlatformActivityWorkspace({
  overviewProps,
  timelineProps,
  timelineLoading = false,
  timelineLoadingMessage = "Loading activity...",
  timelineLoadingClassName = "",
  chartHeight,
  minimumTimelineHeight = 220,
  className = "",
  style,
  ...props
}: PlatformActivityWorkspaceProps) {
  return (
    <div
      {...props}
      className={joinClassNames("platform-activity-workspace", className)}
      style={buildWorkspaceStyle(style, chartHeight, minimumTimelineHeight)}
    >
      <PlatformActivityOverview {...overviewProps} />
      <div className="platform-activity-workspace__timeline">
        {timelineLoading ? (
          <PlatformLoadingState
            className={joinClassNames(
              "platform-activity-workspace__loading",
              timelineLoadingClassName,
            )}
            message={timelineLoadingMessage}
            centered
          />
        ) : (
          <PlatformActivityTimeline {...timelineProps} />
        )}
      </div>
    </div>
  );
}
