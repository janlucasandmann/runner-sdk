import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";

const LOGS_AUTO_SCROLL_BOTTOM_THRESHOLD_PX = 24;
const LOGS_AUTO_SCROLL_SETTLE_FRAME_COUNT = 3;

type RunnerLogViewportMetrics = Pick<HTMLDivElement, "clientHeight" | "scrollHeight" | "scrollTop">;

export function isRunnerLogViewportPinnedToBottom(element: RunnerLogViewportMetrics): boolean {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <=
    LOGS_AUTO_SCROLL_BOTTOM_THRESHOLD_PX
  );
}

interface UseRunnerLogAutoScrollOptions {
  canonicalSequence: number;
  contentWidthRef: RefObject<HTMLDivElement | null>;
  executionLogs: readonly unknown[];
  hasCustomEmptyState: boolean;
  logsRef: RefObject<HTMLDivElement | null>;
  threadId: string | null;
  turns: readonly unknown[];
  usesCanonicalThreadSurface: boolean;
}

/**
 * Keeps a live thread pinned to its latest activity until the user deliberately
 * scrolls away. The hook owns only viewport behavior; the caller still owns the
 * DOM refs and the thread rendering lifecycle.
 */
export function useRunnerLogAutoScroll({
  canonicalSequence,
  contentWidthRef,
  executionLogs,
  hasCustomEmptyState,
  logsRef,
  threadId,
  turns,
  usesCanonicalThreadSurface,
}: UseRunnerLogAutoScrollOptions): void {
  const shouldAutoScrollRef = useRef(true);
  const isProgrammaticAutoScrollRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const settleFramesRef = useRef(0);

  useLayoutEffect(() => {
    void threadId;
    shouldAutoScrollRef.current = true;
    isProgrammaticAutoScrollRef.current = false;
    settleFramesRef.current = 0;
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [threadId]);

  useEffect(() => {
    void threadId;
    const scrollElement = logsRef.current;
    if (!scrollElement) {
      return;
    }
    const resolvedScrollElement = scrollElement;

    function stopProgrammaticAutoScroll() {
      shouldAutoScrollRef.current = false;
      isProgrammaticAutoScrollRef.current = false;
      settleFramesRef.current = 0;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    function handleViewportScroll() {
      const isPinnedToBottom = isRunnerLogViewportPinnedToBottom(resolvedScrollElement);
      if (isProgrammaticAutoScrollRef.current) {
        shouldAutoScrollRef.current = true;
        if (isPinnedToBottom) {
          isProgrammaticAutoScrollRef.current = false;
        }
        return;
      }
      shouldAutoScrollRef.current = isPinnedToBottom;
    }

    function handleViewportUserIntent(event: WheelEvent | TouchEvent) {
      const wheelDeltaY = "deltaY" in event ? Number(event.deltaY || 0) : 0;
      if (wheelDeltaY < 0 || !isRunnerLogViewportPinnedToBottom(resolvedScrollElement)) {
        stopProgrammaticAutoScroll();
      }
    }

    handleViewportScroll();
    resolvedScrollElement.addEventListener("scroll", handleViewportScroll, {
      passive: true,
    });
    resolvedScrollElement.addEventListener("wheel", handleViewportUserIntent, {
      passive: true,
    });
    resolvedScrollElement.addEventListener("touchmove", handleViewportUserIntent, {
      passive: true,
    });

    return () => {
      resolvedScrollElement.removeEventListener("scroll", handleViewportScroll);
      resolvedScrollElement.removeEventListener("wheel", handleViewportUserIntent);
      resolvedScrollElement.removeEventListener("touchmove", handleViewportUserIntent);
    };
  }, [logsRef, threadId]);

  const scheduleAutoScrollToBottom = useCallback(
    (settleFrames = LOGS_AUTO_SCROLL_SETTLE_FRAME_COUNT) => {
      if (typeof window === "undefined") {
        return;
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      isProgrammaticAutoScrollRef.current = true;
      settleFramesRef.current = Math.max(settleFrames, 0);

      const applyPinnedAutoScroll = () => {
        const scrollElement = logsRef.current;
        if (!scrollElement || !shouldAutoScrollRef.current) {
          animationFrameRef.current = null;
          settleFramesRef.current = 0;
          return;
        }

        const prefersReducedMotion =
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (typeof scrollElement.scrollTo === "function") {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        } else {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }

        if (settleFramesRef.current > 0) {
          settleFramesRef.current -= 1;
          animationFrameRef.current = window.requestAnimationFrame(applyPinnedAutoScroll);
          return;
        }

        if (isRunnerLogViewportPinnedToBottom(scrollElement)) {
          isProgrammaticAutoScrollRef.current = false;
        }
        animationFrameRef.current = null;
      };

      animationFrameRef.current = window.requestAnimationFrame(applyPinnedAutoScroll);
    },
    [logsRef],
  );

  useLayoutEffect(() => {
    void canonicalSequence;
    void executionLogs;
    void turns;
    void usesCanonicalThreadSurface;
    const scrollElement = logsRef.current;
    if (!scrollElement) {
      return;
    }
    if (hasCustomEmptyState) {
      scrollElement.scrollTop = 0;
      return;
    }
    if (!shouldAutoScrollRef.current) {
      return;
    }
    scheduleAutoScrollToBottom();
  }, [
    canonicalSequence,
    executionLogs,
    hasCustomEmptyState,
    logsRef,
    scheduleAutoScrollToBottom,
    turns,
    usesCanonicalThreadSurface,
  ]);

  useLayoutEffect(() => {
    void threadId;
    const contentElement = contentWidthRef.current;
    if (!contentElement || typeof ResizeObserver === "undefined" || hasCustomEmptyState) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (shouldAutoScrollRef.current) {
        scheduleAutoScrollToBottom();
      }
    });
    resizeObserver.observe(contentElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [contentWidthRef, hasCustomEmptyState, scheduleAutoScrollToBottom, threadId]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
}
