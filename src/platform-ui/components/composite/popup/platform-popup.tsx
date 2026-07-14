import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

export type PlatformPopupAnimation =
  | "up-in"
  | "up-out"
  | "down-in"
  | "down-out"
  | "left-in"
  | "left-out";

export type PlatformPopupMode = "anchored" | "fixed" | "inline";

export interface PlatformPopupSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  animation?: PlatformPopupAnimation | false;
  animateHeight?: boolean;
  heightAnimationDurationMs?: number;
  mode?: PlatformPopupMode;
  width?: CSSProperties["width"];
  maxWidth?: CSSProperties["maxWidth"];
  maxHeight?: CSSProperties["maxHeight"];
}

export interface PlatformPopupProps {
  open: boolean;
  trigger?: ReactNode | ((state: { open: boolean }) => ReactNode);
  children?: ReactNode;
  rootRef?: Ref<HTMLDivElement>;
  surfaceRef?: Ref<HTMLDivElement>;
  rootClassName?: string;
  surfaceClassName?: string;
  surfaceProps?: Omit<PlatformPopupSurfaceProps, "animation" | "children" | "className">;
  animation?: PlatformPopupAnimation | false;
}

export type PlatformPopupDismissLayerProps = HTMLAttributes<HTMLDivElement>;

export function joinPlatformPopupClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

function assignPlatformPopupRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export function inferPlatformPopupAnimation(className: string): PlatformPopupAnimation | false {
  const tokens = className.split(/\s+/).filter(Boolean);
  if (tokens.some((token) => /(?:^|-)animate-up-out$/.test(token))) return "up-out";
  if (tokens.some((token) => /(?:^|-)animate-up-in$/.test(token))) return "up-in";
  if (tokens.some((token) => /(?:^|-)animate-down-out$/.test(token))) return "down-out";
  if (tokens.some((token) => /(?:^|-)animate-down-in$/.test(token))) return "down-in";
  if (tokens.includes("is-closing")) return "down-out";
  return false;
}

export const PlatformPopupSurface = forwardRef<HTMLDivElement, PlatformPopupSurfaceProps>(
  function PlatformPopupSurface({
    animation,
    animateHeight = false,
    heightAnimationDurationMs = 180,
    mode = "anchored",
    width,
    maxWidth,
    maxHeight,
    className = "",
    children,
    style,
    ...props
  }, forwardedRef) {
    const localSurfaceRef = useRef<HTMLDivElement | null>(null);
    const previousHeightRef = useRef<number | null>(null);
    const heightAnimationRef = useRef<Animation | null>(null);
    const setSurfaceRef = useCallback((element: HTMLDivElement | null) => {
      localSurfaceRef.current = element;
      assignPlatformPopupRef(forwardedRef, element);
    }, [forwardedRef]);
    const resolvedAnimation = animation === false
      ? false
      : animation || inferPlatformPopupAnimation(className);

    useLayoutEffect(() => {
      const surface = localSurfaceRef.current;
      if (!surface) return;

      const activeAnimation = heightAnimationRef.current;
      const previousHeight = activeAnimation
        ? surface.getBoundingClientRect().height
        : previousHeightRef.current;
      if (activeAnimation) {
        activeAnimation.cancel();
        heightAnimationRef.current = null;
      }

      const nextHeight = surface.getBoundingClientRect().height;
      previousHeightRef.current = nextHeight;
      const prefersReducedMotion = typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (
        !animateHeight
        || prefersReducedMotion
        || previousHeight === null
        || Math.abs(nextHeight - previousHeight) < 1
        || typeof surface.animate !== "function"
      ) {
        return;
      }

      const heightAnimation = surface.animate([
        { height: `${previousHeight}px` },
        { height: `${nextHeight}px` },
      ], {
        duration: Math.max(0, heightAnimationDurationMs),
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
      const clearAnimation = () => {
        if (heightAnimationRef.current === heightAnimation) {
          heightAnimationRef.current = null;
        }
      };
      heightAnimation.onfinish = clearAnimation;
      heightAnimation.oncancel = clearAnimation;
      heightAnimationRef.current = heightAnimation;
    }, [animateHeight, children, heightAnimationDurationMs]);

    useLayoutEffect(() => () => {
      heightAnimationRef.current?.cancel();
      heightAnimationRef.current = null;
    }, []);

    return (
      <div
        {...props}
        ref={setSurfaceRef}
        className={joinPlatformPopupClassNames(
          "platform-popup-surface",
          "tb-popup-menu",
          mode !== "anchored" && `is-${mode}`,
          className
        )}
        data-platform-popup-animation={resolvedAnimation || undefined}
        data-platform-popup-height-animation={animateHeight ? "enabled" : undefined}
        data-platform-popup-mode={mode}
        style={{
          ...style,
          width: width ?? style?.width,
          maxWidth: maxWidth ?? style?.maxWidth,
          maxHeight: maxHeight ?? style?.maxHeight,
        }}
      >
        {children}
      </div>
    );
  }
);

export const PlatformPopupDismissLayer = forwardRef<HTMLDivElement, PlatformPopupDismissLayerProps>(
  function PlatformPopupDismissLayer({ className = "", ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={joinPlatformPopupClassNames("platform-popup-dismiss-layer", className)}
        aria-hidden={props["aria-hidden"] ?? "true"}
      />
    );
  }
);

export function PlatformPopup({
  open,
  trigger,
  children,
  rootRef,
  surfaceRef,
  rootClassName = "",
  surfaceClassName = "",
  surfaceProps = {},
  animation,
}: PlatformPopupProps) {
  const resolvedTrigger = typeof trigger === "function" ? trigger({ open }) : trigger;

  return (
    <div
      ref={rootRef}
      className={joinPlatformPopupClassNames(
        "platform-popup-anchor",
        rootClassName,
        open && "is-open"
      )}
    >
      {resolvedTrigger}
      {open ? (
        <PlatformPopupSurface
          {...surfaceProps}
          ref={surfaceRef}
          className={surfaceClassName}
          animation={animation}
        >
          {children}
        </PlatformPopupSurface>
      ) : null}
    </div>
  );
}
