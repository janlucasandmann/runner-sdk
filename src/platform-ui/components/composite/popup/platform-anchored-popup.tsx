import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type PlatformPopupAnchorRef<T extends HTMLElement = HTMLElement> = {
  current: T | null;
};

export type PlatformAnchoredPopupPlacement =
  | "above-start"
  | "above-end"
  | "below-start"
  | "side-end";

export interface PlatformAnchoredPopupOptions {
  open: boolean;
  anchorRef: PlatformPopupAnchorRef;
  verticalAnchorRef?: PlatformPopupAnchorRef;
  popupRef: PlatformPopupAnchorRef;
  placement?: PlatformAnchoredPopupPlacement;
  gap?: number;
  viewportPadding?: number;
  offsetX?: number;
  offsetY?: number;
  matchAnchorWidth?: boolean;
}

export interface PlatformAnchoredPopupPortalOptions {
  rootClassName?: string;
  scopeClassName?: string;
}

/**
 * Positions a popup against a stable DOM anchor and keeps it synchronized while
 * either element, the viewport, or a scroll container changes. Shared composer
 * surfaces use this instead of each feature inventing its own fixed positioning.
 */
export function usePlatformAnchoredPopupStyle({
  open,
  anchorRef,
  verticalAnchorRef,
  popupRef,
  placement = "above-start",
  gap = 8,
  viewportPadding = 8,
  offsetX = 0,
  offsetY = 0,
  matchAnchorWidth = false,
}: PlatformAnchoredPopupOptions): CSSProperties | null {
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }
    if (typeof window === "undefined") return;

    let frameId = 0;
    const settleFrameIds: number[] = [];
    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => scheduleUpdate())
      : null;
    let observedElements = new Set<HTMLElement>();

    const observeCurrentElements = (...elements: Array<HTMLElement | null>) => {
      if (!resizeObserver) return;
      const nextElements = new Set(
        elements.filter((element): element is HTMLElement => Boolean(element)),
      );
      observedElements.forEach((element) => {
        if (!nextElements.has(element)) resizeObserver.unobserve(element);
      });
      nextElements.forEach((element) => {
        if (!observedElements.has(element)) resizeObserver.observe(element);
      });
      observedElements = nextElements;
    };

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) {
        setStyle(null);
        return;
      }

      const popup = popupRef.current;
      const verticalAnchor = verticalAnchorRef?.current || anchor;
      const anchorRect = anchor.getBoundingClientRect();
      const verticalAnchorRect = verticalAnchor.getBoundingClientRect();
      const popupWidth = matchAnchorWidth
        ? anchorRect.width
        : popup?.offsetWidth || 240;
      const popupHeight = popup?.offsetHeight || 0;
      const visualViewport = window.visualViewport;
      const viewportWidth = visualViewport?.width || window.innerWidth;
      const viewportHeight = visualViewport?.height || window.innerHeight;
      const viewportLeft = visualViewport?.offsetLeft || 0;
      const viewportTop = visualViewport?.offsetTop || 0;
      const maxLeft = viewportLeft + viewportWidth - popupWidth - viewportPadding;
      const layoutViewportHeight = window.innerHeight;
      const viewportBottom = viewportTop + viewportHeight;
      const maxBottom = Math.max(
        viewportPadding,
        layoutViewportHeight - viewportBottom + viewportPadding,
      );

      let left = anchorRect.left;
      let bottomEdge = verticalAnchorRect.top - gap;
      if (placement === "above-end") {
        left = anchorRect.right - popupWidth;
      } else if (placement === "side-end") {
        left = anchorRect.right + gap;
        bottomEdge = verticalAnchorRect.bottom;
        if (left + popupWidth > viewportLeft + viewportWidth - viewportPadding) {
          left = anchorRect.left - popupWidth - gap;
        }
      }

      left += offsetX;
      bottomEdge += offsetY;
      const clampedLeft = Math.min(
        Math.max(left, viewportLeft + viewportPadding),
        Math.max(viewportLeft + viewportPadding, maxLeft),
      );

      if (placement === "below-start") {
        const unclampedTop = verticalAnchorRect.bottom + gap + offsetY;
        const maxTop = viewportBottom - popupHeight - viewportPadding;
        const clampedTop = Math.max(
          viewportTop + viewportPadding,
          Math.min(unclampedTop, maxTop),
        );
        observeCurrentElements(anchor, verticalAnchor, popup || null);
        setStyle({
          left: `${Math.round(clampedLeft)}px`,
          top: `${Math.round(clampedTop)}px`,
          bottom: "auto",
          ...(matchAnchorWidth ? { width: `${Math.round(anchorRect.width)}px` } : {}),
          visibility: "visible",
        });
        return;
      }

      let bottom = layoutViewportHeight - bottomEdge;
      const unclampedTop = bottomEdge - popupHeight;
      if (unclampedTop < viewportTop + viewportPadding) {
        bottom = Math.min(
          bottom,
          layoutViewportHeight - (viewportTop + viewportPadding + popupHeight),
        );
      }

      observeCurrentElements(anchor, verticalAnchor, popup || null);
      setStyle({
        left: `${Math.round(clampedLeft)}px`,
        top: "auto",
        bottom: `${Math.max(maxBottom, Math.round(bottom))}px`,
        ...(matchAnchorWidth ? { width: `${Math.round(anchorRect.width)}px` } : {}),
        visibility: "visible",
      });
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(update);
    };

    update();
    const scheduleSettledUpdate = (remainingFrames: number) => {
      const settledFrameId = window.requestAnimationFrame(() => {
        scheduleUpdate();
        if (remainingFrames > 1) scheduleSettledUpdate(remainingFrames - 1);
      });
      settleFrameIds.push(settledFrameId);
    };
    scheduleSettledUpdate(4);

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleUpdate);
    observeCurrentElements(
      anchorRef.current,
      verticalAnchorRef?.current || null,
      popupRef.current,
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      settleFrameIds.forEach((id) => window.cancelAnimationFrame(id));
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [
    anchorRef,
    gap,
    matchAnchorWidth,
    offsetX,
    offsetY,
    open,
    placement,
    popupRef,
    verticalAnchorRef,
    viewportPadding,
  ]);

  return style;
}

/** Renders an anchored popup into the document body without losing UI scope. */
export function renderPlatformAnchoredPopupPortal(
  content: ReactNode,
  style: CSSProperties | null,
  {
    rootClassName = "tb-composer-popup-portal-root",
    scopeClassName = "tb-runner-chat tb-composer-popup-portal-scope",
  }: PlatformAnchoredPopupPortalOptions = {},
): ReactNode {
  if (!content || typeof document === "undefined") return null;
  const resolvedStyle: CSSProperties = style || {
    left: "-9999px",
    top: "0px",
    bottom: "auto",
    visibility: "hidden",
  };
  return createPortal(
    <div className={rootClassName} style={resolvedStyle}>
      <div className={scopeClassName}>{content}</div>
    </div>,
    document.body,
  );
}
