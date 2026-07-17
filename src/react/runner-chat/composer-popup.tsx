import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export const POPUP_ANIMATION_DURATION_MS = 180;
export const RUNNER_COMPOSER_POPUP_OPEN_EVENT =
  "tb-runner-composer-popup-open";

export type InputPopupId =
  | "main"
  | "context"
  | "skills"
  | "agent"
  | "agent-reasoning"
  | "environment"
  | "organization"
  | "github"
  | "notion"
  | "google-drive"
  | "one-drive"
  | "schedule"
  | "attach-files";

export type MainPopupRenderId =
  | "main"
  | "context"
  | "agent"
  | "environment"
  | "organization";
export type SidePopupRenderId = Exclude<InputPopupId, MainPopupRenderId>;
export type PopupAnimationPhase = "idle" | "enter" | "exit";
export type SidePopupExitDirection = "left" | "down";
export type ComposerPopupPlacement =
  | "above-start"
  | "above-end"
  | "side-end";
export type ComposerPopupAnchorRef<T extends HTMLElement = HTMLElement> = {
  current: T | null;
};

export interface ComposerAnchoredPopupOptions {
  open: boolean;
  anchorRef: ComposerPopupAnchorRef;
  verticalAnchorRef?: ComposerPopupAnchorRef;
  popupRef: ComposerPopupAnchorRef;
  placement?: ComposerPopupPlacement;
  gap?: number;
  viewportPadding?: number;
  offsetX?: number;
  offsetY?: number;
}

export function emitRunnerComposerPopupOpen(sourceId: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RUNNER_COMPOSER_POPUP_OPEN_EVENT, {
    detail: { sourceId },
  }));
}

export function getRunnerComposerPopupEventSource(event: Event): string {
  if (!(event instanceof CustomEvent)) return "";
  return typeof event.detail?.sourceId === "string"
    ? event.detail.sourceId
    : "";
}

export function useComposerAnchoredPopupStyle({
  open,
  anchorRef,
  verticalAnchorRef,
  popupRef,
  placement = "above-start",
  gap = 8,
  viewportPadding = 8,
  offsetX = 0,
  offsetY = 0,
}: ComposerAnchoredPopupOptions): CSSProperties | null {
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }
    if (typeof window === "undefined") {
      return;
    }

    let frameId = 0;
    const settleFrameIds: number[] = [];
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => scheduleUpdate())
        : null;
    let observedElements = new Set<HTMLElement>();

    const observeCurrentElements = (
      ...elements: Array<HTMLElement | null>
    ) => {
      if (!resizeObserver) {
        return;
      }
      const nextElements = new Set(
        elements.filter(
          (element): element is HTMLElement => Boolean(element),
        ),
      );
      observedElements.forEach((element) => {
        if (!nextElements.has(element)) {
          resizeObserver.unobserve(element);
        }
      });
      nextElements.forEach((element) => {
        if (!observedElements.has(element)) {
          resizeObserver.observe(element);
        }
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
      const popupWidth = popup?.offsetWidth || 240;
      const popupHeight = popup?.offsetHeight || 0;
      const visualViewport = window.visualViewport;
      const viewportWidth = visualViewport?.width || window.innerWidth;
      const viewportHeight = visualViewport?.height || window.innerHeight;
      const viewportLeft = visualViewport?.offsetLeft || 0;
      const viewportTop = visualViewport?.offsetTop || 0;
      const maxLeft =
        viewportLeft + viewportWidth - popupWidth - viewportPadding;
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
        if (
          left + popupWidth
          > viewportLeft + viewportWidth - viewportPadding
        ) {
          left = anchorRect.left - popupWidth - gap;
        }
      }

      left += offsetX;
      bottomEdge += offsetY;

      let bottom = layoutViewportHeight - bottomEdge;
      const unclampedTop = bottomEdge - popupHeight;
      if (unclampedTop < viewportTop + viewportPadding) {
        bottom = Math.min(
          bottom,
          layoutViewportHeight
            - (viewportTop + viewportPadding + popupHeight),
        );
      }

      const clampedLeft = Math.min(
        Math.max(left, viewportLeft + viewportPadding),
        Math.max(viewportLeft + viewportPadding, maxLeft),
      );
      const clampedBottom = Math.max(maxBottom, Math.round(bottom));
      observeCurrentElements(anchor, verticalAnchor, popup || null);
      setStyle({
        left: `${Math.round(clampedLeft)}px`,
        top: "auto",
        bottom: `${clampedBottom}px`,
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
        if (remainingFrames > 1) {
          scheduleSettledUpdate(remainingFrames - 1);
        }
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
      settleFrameIds.forEach((id) => {
        window.cancelAnimationFrame(id);
      });
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [
    anchorRef,
    gap,
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

export function renderComposerPopupPortal(
  content: ReactNode,
  style: CSSProperties | null,
): ReactNode {
  if (!content || typeof document === "undefined") {
    return null;
  }
  const resolvedStyle: CSSProperties = style || {
    left: "-9999px",
    top: "0px",
    bottom: "auto",
    visibility: "hidden",
  };
  return createPortal(
    <div className="tb-composer-popup-portal-root" style={resolvedStyle}>
      <div className="tb-runner-chat tb-composer-popup-portal-scope">
        {content}
      </div>
    </div>,
    document.body,
  );
}

export function isPlusPopupId(
  popup: InputPopupId | null,
): popup is Exclude<
  InputPopupId,
  "context" | "agent" | "agent-reasoning" | "environment" | "organization"
> {
  return popup === "main"
    || popup === "skills"
    || popup === "github"
    || popup === "notion"
    || popup === "google-drive"
    || popup === "one-drive"
    || popup === "schedule"
    || popup === "attach-files";
}

export function getMainPopupRenderId(
  popup: InputPopupId | null,
): MainPopupRenderId | null {
  if (popup === "agent-reasoning") return "agent";
  if (
    popup === "context"
    || popup === "agent"
    || popup === "environment"
    || popup === "organization"
  ) {
    return popup;
  }
  return isPlusPopupId(popup) ? "main" : null;
}

export function getSidePopupRenderId(
  popup: InputPopupId | null,
): SidePopupRenderId | null {
  if (
    !popup
    || popup === "main"
    || popup === "context"
    || popup === "agent"
    || popup === "environment"
    || popup === "organization"
  ) {
    return null;
  }
  return popup;
}
