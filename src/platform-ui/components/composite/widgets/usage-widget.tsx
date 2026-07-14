import { type CSSProperties } from "react";
import { Zap } from "lucide-react";
import {
  PlatformDefaultWidget,
  type PlatformDefaultWidgetProps,
  joinPlatformWidgetClassNames,
} from "./platform-widget.js";

type WidgetCSSProperties = CSSProperties & Record<`--${string}`, string | number>;

export interface PlatformUsageWidgetProps extends Omit<
  PlatformDefaultWidgetProps,
  "children" | "className" | "clickable"
> {
  percentageLabel: string;
  caption: string;
  remaining: string;
  meterBars: readonly number[];
  full?: boolean;
  className?: string;
}

export function PlatformUsageWidget({
  percentageLabel,
  caption,
  remaining,
  meterBars,
  full = false,
  className = "",
  style,
  ...props
}: PlatformUsageWidgetProps) {
  const widgetStyle: WidgetCSSProperties = {
    ...style,
    "--usage-remaining": remaining,
  };

  return (
    <PlatformDefaultWidget
      {...props}
      clickable={false}
      className={joinPlatformWidgetClassNames("playground-thread-widget-usage", className)}
      style={widgetStyle}
    >
      <div className="playground-thread-widget-usage-main">
        <div className="playground-thread-widget-usage-percent">{percentageLabel}</div>
        <div className="playground-thread-widget-usage-caption">{caption}</div>
        <div className="playground-thread-widget-usage-meter">
          <div className="playground-thread-widget-usage-scale">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          <div className="playground-thread-widget-usage-bars" aria-hidden="true">
            {meterBars.map((height, index) => {
              const barStyle: WidgetCSSProperties = {
                "--usage-bar-height": `${Math.round(height)}%`,
              };
              return (
                <span
                  key={`usage-bar:${index}`}
                  className="playground-thread-widget-usage-bar"
                  style={barStyle}
                />
              );
            })}
            <div className={joinPlatformWidgetClassNames(
              "playground-thread-widget-usage-fill",
              full && "is-full"
            )} />
          </div>
        </div>
      </div>
      <div className="playground-thread-widget-usage-side" aria-hidden="true">
        <Zap
          className="playground-thread-widget-usage-icon"
          strokeWidth={0}
          fill="currentColor"
        />
      </div>
    </PlatformDefaultWidget>
  );
}
