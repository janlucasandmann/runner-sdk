import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export interface PlatformVersionLabelProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  version: string | number;
  qualifier?: ReactNode;
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

export function normalizePlatformVersionNumber(
  value: unknown,
  fallback = 0,
): number {
  if (typeof value === "string") {
    const match = value.trim().match(/^(?:v|version\s*)?(\d+)$/i);
    if (match) return Number(match[1]);
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
  const parsedFallback = Number(fallback);
  return Number.isFinite(parsedFallback) && parsedFallback >= 0
    ? Math.floor(parsedFallback)
    : 0;
}

export function formatPlatformVersionLabel(value: unknown): string {
  return `v${normalizePlatformVersionNumber(value)}`;
}

export function formatPlatformVersionTitle(
  value: unknown,
  description?: unknown,
): string {
  const label = formatPlatformVersionLabel(value);
  const normalizedDescription = String(description ?? "").trim();
  return normalizedDescription ? `${label} | ${normalizedDescription}` : label;
}

export const PlatformVersionLabel = forwardRef<
  HTMLButtonElement,
  PlatformVersionLabelProps
>(function PlatformVersionLabel(
  {
    version,
    qualifier,
    type = "button",
    className = "",
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={joinClassNames(
        "platform-version-label",
        Boolean(qualifier) && "has-qualifier",
        className,
      )}
      data-platform-version={normalizePlatformVersionNumber(version)}
    >
      <span className="platform-version-label__version">
        {formatPlatformVersionLabel(version)}
      </span>
      {qualifier ? (
        <>
          <span className="platform-version-label__separator" aria-hidden="true">
            ·
          </span>
          <span className="platform-version-label__qualifier">{qualifier}</span>
        </>
      ) : null}
    </button>
  );
});
