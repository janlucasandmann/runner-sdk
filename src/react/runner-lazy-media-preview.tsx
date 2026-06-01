import { useEffect, useRef, useState, type ReactNode } from "react";
import { DotLoader } from "./dot-loader.js";

function scheduleRunnerMediaPreviewMount(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const win = window as Window & {
    requestIdleCallback?: (
      callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
      options?: { timeout?: number }
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };
  if (typeof win.requestIdleCallback === "function") {
    const handle = win.requestIdleCallback(callback, { timeout: 700 });
    return () => win.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(callback, 80);
  return () => window.clearTimeout(handle);
}

export function RunnerLazyMediaPreviewLoader({
  dotSize = 4,
  gap = 3,
}: {
  dotSize?: number;
  gap?: number;
}) {
  return (
    <span className="tb-runner-media-preview-loader">
      <DotLoader dotCount={9} dotSize={dotSize} gap={gap} className="tb-runner-media-dot-loader" />
    </span>
  );
}

export function LazyMediaPreviewMount({
  mediaKey,
  placeholder,
  children,
  className = "tb-runner-lazy-media-preview",
  rootMargin = "120px 0px",
}: {
  mediaKey: string;
  placeholder: ReactNode;
  children: ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsVisible(false);
    setShouldMount(false);
  }, [mediaKey]);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const node = containerRef.current;
    if (!node) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          return;
        }
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, mediaKey, rootMargin]);

  useEffect(() => {
    if (!isVisible || shouldMount) {
      return;
    }
    return scheduleRunnerMediaPreviewMount(() => setShouldMount(true));
  }, [isVisible, shouldMount, mediaKey]);

  return (
    <div className={className} ref={containerRef}>
      {shouldMount ? children : placeholder}
    </div>
  );
}
