import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RunnerThreadHistoryItem } from "./thread-history.js";

interface RunnerThreadHistoryScrollMetrics {
  anchorHeight: number;
  anchorTop: number;
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
  viewportTop: number;
}

export function getRunnerThreadHistoryTargetScrollTop({
  anchorHeight,
  anchorTop,
  clientHeight,
  scrollHeight,
  scrollTop,
  viewportTop,
}: RunnerThreadHistoryScrollMetrics): number {
  const targetCenter = anchorTop - viewportTop + scrollTop + anchorHeight / 2;
  return Math.max(0, Math.min(targetCenter - clientHeight / 2, scrollHeight - clientHeight));
}

interface UseRunnerThreadHistoryRailOptions {
  contentWidthRef: RefObject<HTMLDivElement | null>;
  expandedTurns: Readonly<Record<string, boolean>>;
  executionLogs: readonly unknown[];
  items: readonly RunnerThreadHistoryItem[];
  logsRef: RefObject<HTMLDivElement | null>;
  previewedDocumentAttachment: unknown;
  surfaceEnabled: boolean;
  turns: readonly unknown[];
}

interface UseRunnerThreadHistoryRailResult {
  activeItemId: string | null;
  activeItemIndex: number;
  areControlsVisible: boolean;
  hoveredItemId: string | null;
  navigate: (direction: -1 | 1) => void;
  nextItem: RunnerThreadHistoryItem | null;
  previousItem: RunnerThreadHistoryItem | null;
  scrollItemIntoView: (itemId: string) => void;
  setAnchorElement: (itemId: string, element: HTMLDivElement | null) => void;
  setHoveredItemId: Dispatch<SetStateAction<string | null>>;
  setRailHovered: Dispatch<SetStateAction<boolean>>;
  shouldDisplay: boolean;
}

/**
 * Owns the measurement and navigation behavior for the compact message-history
 * rail. Rendering remains with RunnerChat so this controller can evolve without
 * coupling viewport mechanics to the rail's visual treatment.
 */
export function useRunnerThreadHistoryRail({
  contentWidthRef,
  expandedTurns,
  executionLogs,
  items,
  logsRef,
  previewedDocumentAttachment,
  surfaceEnabled,
  turns,
}: UseRunnerThreadHistoryRailOptions): UseRunnerThreadHistoryRailResult {
  const anchorElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const measureFrameRef = useRef<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [isRailHovered, setRailHovered] = useState(false);
  const [isAtMaxWidth, setIsAtMaxWidth] = useState(true);

  const userMessageCount = useMemo(
    () => items.reduce((count, item) => count + (item.role === "user" ? 1 : 0), 0),
    [items],
  );
  const shouldDisplay = surfaceEnabled && userMessageCount > 1 && items.length > 0 && isAtMaxWidth;
  const activeItemIndex = items.findIndex((item) => item.id === activeItemId);
  const hoveredItemIndex = items.findIndex((item) => item.id === hoveredItemId);
  const previousItem = activeItemIndex > 0 ? (items[activeItemIndex - 1] ?? null) : null;
  const nextItem =
    activeItemIndex >= 0 && activeItemIndex < items.length - 1
      ? (items[activeItemIndex + 1] ?? null)
      : null;
  const areControlsVisible = isRailHovered || hoveredItemIndex >= 0;

  const setAnchorElement = useCallback((itemId: string, element: HTMLDivElement | null) => {
    if (element) {
      anchorElementsRef.current[itemId] = element;
      return;
    }
    delete anchorElementsRef.current[itemId];
  }, []);

  const updateActiveItem = useCallback(() => {
    if (!shouldDisplay) {
      setActiveItemId(null);
      return;
    }

    const scrollElement = logsRef.current;
    if (!scrollElement) {
      return;
    }
    if (scrollElement.scrollTop <= 8 && items[0]) {
      setActiveItemId((current) => (current === items[0]?.id ? current : (items[0]?.id ?? null)));
      return;
    }

    const scrollRect = scrollElement.getBoundingClientRect();
    const viewportCenter = scrollRect.top + scrollRect.height / 2;
    let nextActiveId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const item of items) {
      const anchor = anchorElementsRef.current[item.id];
      if (!anchor) {
        continue;
      }
      const anchorRect = anchor.getBoundingClientRect();
      const anchorCenter = anchorRect.top + anchorRect.height / 2;
      const distance = Math.abs(anchorCenter - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextActiveId = item.id;
      }
    }

    if (!nextActiveId) {
      nextActiveId = items[items.length - 1]?.id ?? null;
    }
    setActiveItemId((current) => (current === nextActiveId ? current : nextActiveId));
  }, [items, logsRef, shouldDisplay]);

  const scheduleMeasurement = useCallback(() => {
    if (measureFrameRef.current !== null) {
      window.cancelAnimationFrame(measureFrameRef.current);
    }
    measureFrameRef.current = window.requestAnimationFrame(() => {
      measureFrameRef.current = null;
      updateActiveItem();
    });
  }, [updateActiveItem]);

  const scrollItemIntoView = useCallback(
    (itemId: string) => {
      const scrollElement = logsRef.current;
      const anchor = anchorElementsRef.current[itemId];
      if (!scrollElement || !anchor) {
        return;
      }

      const scrollRect = scrollElement.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const nextScrollTop = getRunnerThreadHistoryTargetScrollTop({
        anchorHeight: anchorRect.height,
        anchorTop: anchorRect.top,
        clientHeight: scrollElement.clientHeight,
        scrollHeight: scrollElement.scrollHeight,
        scrollTop: scrollElement.scrollTop,
        viewportTop: scrollRect.top,
      });
      const prefersReducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      scrollElement.scrollTo({
        top: nextScrollTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      setActiveItemId(itemId);
    },
    [logsRef],
  );

  const navigate = useCallback(
    (direction: -1 | 1) => {
      if (activeItemIndex < 0) {
        return;
      }
      const targetItem = items[activeItemIndex + direction];
      if (!targetItem) {
        return;
      }
      setHoveredItemId(null);
      scrollItemIntoView(targetItem.id);
    },
    [activeItemIndex, items, scrollItemIntoView],
  );

  useLayoutEffect(() => {
    void expandedTurns;
    void executionLogs;
    void turns;
    if (shouldDisplay) {
      scheduleMeasurement();
    }
  }, [expandedTurns, executionLogs, scheduleMeasurement, shouldDisplay, turns]);

  useEffect(() => {
    if (!shouldDisplay) {
      setHoveredItemId(null);
      setRailHovered(false);
      setActiveItemId(null);
      return;
    }

    const scrollElement = logsRef.current;
    if (!scrollElement) {
      return;
    }

    function handleViewportChange() {
      scheduleMeasurement();
    }

    scrollElement.addEventListener("scroll", handleViewportChange, {
      passive: true,
    });
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleMeasurement) : null;
    resizeObserver?.observe(scrollElement);
    window.addEventListener("resize", handleViewportChange);
    scheduleMeasurement();

    return () => {
      scrollElement.removeEventListener("scroll", handleViewportChange);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [logsRef, scheduleMeasurement, shouldDisplay]);

  useEffect(() => {
    if (activeItemId && !items.some((item) => item.id === activeItemId)) {
      setActiveItemId(null);
    }
    if (hoveredItemId && !items.some((item) => item.id === hoveredItemId)) {
      setHoveredItemId(null);
    }
  }, [activeItemId, hoveredItemId, items]);

  useLayoutEffect(() => {
    void previewedDocumentAttachment;
    void turns.length;
    const contentElement = contentWidthRef.current;
    if (!contentElement) {
      return;
    }
    const resolvedContentElement = contentElement;

    function updateWidthEligibility() {
      const computedMaxWidth = Number.parseFloat(
        window.getComputedStyle(resolvedContentElement).maxWidth,
      );
      const actualWidth = resolvedContentElement.getBoundingClientRect().width;
      const nextIsAtMaxWidth =
        Number.isFinite(computedMaxWidth) && computedMaxWidth > 0
          ? actualWidth >= computedMaxWidth - 1
          : true;
      setIsAtMaxWidth((current) => (current === nextIsAtMaxWidth ? current : nextIsAtMaxWidth));
    }

    updateWidthEligibility();
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateWidthEligibility) : null;
    resizeObserver?.observe(resolvedContentElement);
    window.addEventListener("resize", updateWidthEligibility);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateWidthEligibility);
    };
  }, [contentWidthRef, previewedDocumentAttachment, turns.length]);

  useEffect(() => {
    return () => {
      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current);
      }
    };
  }, []);

  return {
    activeItemId,
    activeItemIndex,
    areControlsVisible,
    hoveredItemId,
    navigate,
    nextItem,
    previousItem,
    scrollItemIntoView,
    setAnchorElement,
    setHoveredItemId,
    setRailHovered,
    shouldDisplay,
  };
}
