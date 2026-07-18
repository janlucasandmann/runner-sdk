import type {
  HTMLAttributes,
  ReactNode,
} from "react";
import {
  PlatformDataTable,
  type PlatformDataTableProps,
} from "../data-table/index.js";

export type PlatformSettingsSectionBodyPresentation = "default" | "flush";

export interface PlatformSettingsSectionListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface PlatformSettingsSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  bodyPresentation?: PlatformSettingsSectionBodyPresentation;
}

export type PlatformSettingsDataTableProps<TData> = PlatformDataTableProps<TData>;

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export function PlatformSettingsSectionList({
  children,
  className = "",
  ...props
}: PlatformSettingsSectionListProps) {
  return (
    <div
      {...props}
      className={joinClassNames("platform-settings-section-list", className)}
      data-platform-settings-section-list="true"
    >
      {children}
    </div>
  );
}

export function PlatformSettingsSection({
  title,
  description,
  icon,
  actions,
  children,
  bodyClassName = "",
  bodyPresentation = "default",
  className = "",
  ...props
}: PlatformSettingsSectionProps) {
  const hasHeader = Boolean(title || description || icon || actions);

  return (
    <section
      {...props}
      className={joinClassNames(
        "platform-settings-section",
        hasHeader && "has-header",
        className,
      )}
      data-platform-settings-section="true"
    >
      {hasHeader ? (
        <header className="platform-settings-section__header">
          <div className="platform-settings-section__heading">
            {icon ? (
              <span className="platform-settings-section__icon" aria-hidden="true">
                {icon}
              </span>
            ) : null}
            {title || description ? (
              <div className="platform-settings-section__heading-copy">
                {title ? <h2 className="platform-settings-section__title">{title}</h2> : null}
                {description ? (
                  <div className="platform-settings-section__description">{description}</div>
                ) : null}
              </div>
            ) : null}
          </div>
          {actions ? (
            <div className="platform-settings-section__actions">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div
        className={joinClassNames(
          "platform-settings-section__body",
          bodyPresentation === "flush" && "is-flush",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function PlatformSettingsDataTable<TData>({
  className = "",
  surface = "plain",
  layout = "content",
  variant = "minimalistic-ui",
  sticky = false,
  rowMinHeight = 56,
  pagination = false,
  ...props
}: PlatformSettingsDataTableProps<TData>) {
  return (
    <PlatformDataTable
      {...props}
      className={joinClassNames("platform-settings-data-table", className)}
      surface={surface}
      layout={layout}
      variant={variant}
      sticky={sticky}
      rowMinHeight={rowMinHeight}
      pagination={pagination}
    />
  );
}
