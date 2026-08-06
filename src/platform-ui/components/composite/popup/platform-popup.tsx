import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

export type PlatformPopupAnimation =
  | "up-in"
  | "up-out"
  | "down-in"
  | "down-out"
  | "left-in"
  | "left-out";

export type PlatformPopupMode = "anchored" | "fixed" | "inline";
export type PlatformPopupVariant = "default" | "minimal";
export type PlatformPopupPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end";

export interface PlatformPopupAnchorPoint {
  x: number;
  y: number;
}

export interface PlatformPopupSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  [dataAttribute: `data-${string}`]: string | number | undefined;
  animation?: PlatformPopupAnimation | false;
  animateHeight?: boolean;
  heightAnimationDurationMs?: number;
  mode?: PlatformPopupMode;
  variant?: PlatformPopupVariant;
  width?: CSSProperties["width"];
  maxWidth?: CSSProperties["maxWidth"];
  maxHeight?: CSSProperties["maxHeight"];
}

export interface PlatformPopupProps {
  open: boolean;
  trigger?: ReactNode | ((state: { open: boolean }) => ReactNode);
  children?: ReactNode;
  rootRef?: Ref<HTMLDivElement>;
  rootProps?: Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;
  surfaceRef?: Ref<HTMLDivElement>;
  rootClassName?: string;
  surfaceClassName?: string;
  surfaceProps?: Omit<PlatformPopupSurfaceProps, "animation" | "children" | "className" | "variant">;
  animation?: PlatformPopupAnimation | false;
  variant?: PlatformPopupVariant;
  portal?: boolean;
  portalTarget?: Element | DocumentFragment | null;
  placement?: PlatformPopupPlacement;
  portalOffset?: number;
  portalCollisionPadding?: number;
  portalMatchAnchorWidth?: boolean;
  portalAnchorPoint?: PlatformPopupAnchorPoint | null;
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

interface PlatformPopupPortalPosition {
  left: number;
  top: number;
  width: number | null;
  placement: PlatformPopupPlacement;
  ready: boolean;
}

const INITIAL_PLATFORM_POPUP_PORTAL_POSITION: PlatformPopupPortalPosition = {
  left: 0,
  top: 0,
  width: null,
  placement: "bottom-start",
  ready: false,
};

function clampPlatformPopupCoordinate(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function getPlatformPopupPointRect(
  point: PlatformPopupAnchorPoint,
): DOMRect {
  const x = Number.isFinite(point.x) ? point.x : 0;
  const y = Number.isFinite(point.y) ? point.y : 0;
  return {
    x,
    y,
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
    toJSON: () => ({ x, y, width: 0, height: 0 }),
  } as DOMRect;
}

function getPlatformPopupPortalPosition({
  anchorRect,
  surfaceRect,
  placement,
  offset,
  collisionPadding,
  matchAnchorWidth,
}: {
  anchorRect: DOMRect;
  surfaceRect: DOMRect;
  placement: PlatformPopupPlacement;
  offset: number;
  collisionPadding: number;
  matchAnchorWidth: boolean;
}): PlatformPopupPortalPosition {
  const viewportWidth = Math.max(
    0,
    typeof window === "undefined" ? 0 : window.innerWidth,
    typeof document === "undefined" ? 0 : document.documentElement.clientWidth,
  );
  const viewportHeight = Math.max(
    0,
    typeof window === "undefined" ? 0 : window.innerHeight,
    typeof document === "undefined" ? 0 : document.documentElement.clientHeight,
  );
  const surfaceWidth = Math.max(surfaceRect.width, matchAnchorWidth ? anchorRect.width : 0);
  const surfaceHeight = surfaceRect.height;
  const requestedSide = placement.split("-")[0] as "bottom" | "top" | "right" | "left";
  const alignment = placement.endsWith("end") ? "end" : "start";
  const roomAbove = anchorRect.top - collisionPadding - offset;
  const roomBelow = viewportHeight - collisionPadding - anchorRect.bottom - offset;
  const roomLeft = anchorRect.left - collisionPadding - offset;
  const roomRight = viewportWidth - collisionPadding - anchorRect.right - offset;
  const isHorizontal = requestedSide === "right" || requestedSide === "left";
  const resolvedSide = isHorizontal
    ? requestedSide === "right"
      ? (surfaceWidth > roomRight && roomLeft > roomRight ? "left" : "right")
      : (surfaceWidth > roomLeft && roomRight > roomLeft ? "right" : "left")
    : requestedSide === "bottom"
      ? (surfaceHeight > roomBelow && roomAbove > roomBelow ? "top" : "bottom")
      : (surfaceHeight > roomAbove && roomBelow > roomAbove ? "bottom" : "top");
  const resolvedPlacement = `${resolvedSide}-${alignment}` as PlatformPopupPlacement;
  const preferredLeft = isHorizontal
    ? resolvedSide === "left"
      ? anchorRect.left - offset - surfaceWidth
      : anchorRect.right + offset
    : alignment === "end"
      ? anchorRect.right - surfaceWidth
      : anchorRect.left;
  const preferredTop = isHorizontal
    ? alignment === "end"
      ? anchorRect.bottom - surfaceHeight
      : anchorRect.top
    : resolvedSide === "top"
      ? anchorRect.top - offset - surfaceHeight
      : anchorRect.bottom + offset;

  return {
    left: clampPlatformPopupCoordinate(
      preferredLeft,
      collisionPadding,
      viewportWidth - collisionPadding - surfaceWidth,
    ),
    top: clampPlatformPopupCoordinate(
      preferredTop,
      collisionPadding,
      viewportHeight - collisionPadding - surfaceHeight,
    ),
    width: matchAnchorWidth ? surfaceWidth : null,
    placement: resolvedPlacement,
    ready: true,
  };
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
    variant = "default",
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
          variant !== "default" && `is-${variant}`,
          className
        )}
        data-platform-popup-animation={resolvedAnimation || undefined}
        data-platform-popup-height-animation={animateHeight ? "enabled" : undefined}
        data-platform-popup-mode={mode}
        data-platform-popup-variant={variant}
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
  rootProps = {},
  surfaceRef,
  rootClassName = "",
  surfaceClassName = "",
  surfaceProps = {},
  animation,
  variant = "default",
  portal = false,
  portalTarget,
  placement = "bottom-start",
  portalOffset = 8,
  portalCollisionPadding = 8,
  portalMatchAnchorWidth = false,
  portalAnchorPoint = null,
}: PlatformPopupProps) {
  const localRootRef = useRef<HTMLDivElement | null>(null);
  const localSurfaceRef = useRef<HTMLDivElement | null>(null);
  const [portalPosition, setPortalPosition] = useState<PlatformPopupPortalPosition>(
    INITIAL_PLATFORM_POPUP_PORTAL_POSITION,
  );
  const setRootRef = useCallback((element: HTMLDivElement | null) => {
    localRootRef.current = element;
    assignPlatformPopupRef(rootRef, element);
  }, [rootRef]);
  const setSurfaceRef = useCallback((element: HTMLDivElement | null) => {
    localSurfaceRef.current = element;
    assignPlatformPopupRef(surfaceRef, element);
  }, [surfaceRef]);
  const updatePortalPosition = useCallback(() => {
    const anchor = localRootRef.current;
    const surface = localSurfaceRef.current;
    if (!portal || !open || !anchor || !surface) return;
    const nextPosition = getPlatformPopupPortalPosition({
      anchorRect: portalAnchorPoint
        ? getPlatformPopupPointRect(portalAnchorPoint)
        : anchor.getBoundingClientRect(),
      surfaceRect: surface.getBoundingClientRect(),
      placement,
      offset: Math.max(0, portalOffset),
      collisionPadding: Math.max(0, portalCollisionPadding),
      matchAnchorWidth: portalMatchAnchorWidth,
    });
    setPortalPosition((current) => (
      current.left === nextPosition.left
      && current.top === nextPosition.top
      && current.width === nextPosition.width
      && current.placement === nextPosition.placement
      && current.ready === nextPosition.ready
        ? current
        : nextPosition
    ));
  }, [
    open,
    placement,
    portal,
    portalCollisionPadding,
    portalAnchorPoint,
    portalMatchAnchorWidth,
    portalOffset,
  ]);

  useLayoutEffect(() => {
    if (!portal || !open) return;
    updatePortalPosition();
  }, [children, open, portal, updatePortalPosition]);

  useLayoutEffect(() => {
    if (!portal || !open || typeof window === "undefined") return undefined;
    let animationFrame = 0;
    const schedulePositionUpdate = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updatePortalPosition();
      });
    };
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(schedulePositionUpdate);
    if (localRootRef.current) resizeObserver?.observe(localRootRef.current);
    if (localSurfaceRef.current) resizeObserver?.observe(localSurfaceRef.current);
    window.addEventListener("resize", schedulePositionUpdate);
    window.addEventListener("scroll", schedulePositionUpdate, true);
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", schedulePositionUpdate);
      window.removeEventListener("scroll", schedulePositionUpdate, true);
    };
  }, [open, portal, updatePortalPosition]);

  const resolvedTrigger = typeof trigger === "function" ? trigger({ open }) : trigger;
  const {
    style: surfaceStyle,
    ...restSurfaceProps
  } = surfaceProps;
  const resolvedPortalTarget = portalTarget
    ?? (typeof document !== "undefined" ? document.body : null);
  const popupSurface = open ? (
    <PlatformPopupSurface
      {...restSurfaceProps}
      ref={setSurfaceRef}
      className={joinPlatformPopupClassNames(
        surfaceClassName,
        portal && "is-portaled",
      )}
      animation={animation}
      variant={variant}
      mode={portal ? "fixed" : restSurfaceProps.mode}
      data-platform-popup-portaled={portal ? "true" : undefined}
      data-platform-popup-placement={portal ? portalPosition.placement : undefined}
      style={{
        ...surfaceStyle,
        ...(portal
          ? {
              left: portalPosition.left,
              top: portalPosition.top,
              width: restSurfaceProps.width
                ?? surfaceStyle?.width
                ?? portalPosition.width
                ?? undefined,
              visibility: portalPosition.ready
                ? surfaceStyle?.visibility
                : "hidden",
            }
          : null),
      }}
    >
      {children}
    </PlatformPopupSurface>
  ) : null;
  const renderedSurface = portal && resolvedPortalTarget && popupSurface
    ? createPortal(popupSurface, resolvedPortalTarget)
    : popupSurface;

  return (
    <div
      {...rootProps}
      ref={setRootRef}
      className={joinPlatformPopupClassNames(
        "platform-popup-anchor",
        rootClassName,
        open && "is-open"
      )}
    >
      {resolvedTrigger}
      {renderedSurface}
    </div>
  );
}
