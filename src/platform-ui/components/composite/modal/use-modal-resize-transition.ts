import {
  useCallback,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";

interface ModalSurfaceSize {
  width: number;
  height: number;
}

interface UseModalResizeTransitionOptions {
  active: boolean;
  enabled: boolean;
  durationMs: number;
}

const MODAL_RESIZE_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

function readModalSurfaceSize(element: HTMLElement): ModalSurfaceSize {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

function hasModalSurfaceSizeChanged(
  previousSize: ModalSurfaceSize,
  nextSize: ModalSurfaceSize,
): boolean {
  return Math.abs(previousSize.width - nextSize.width) >= 1
    || Math.abs(previousSize.height - nextSize.height) >= 1;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useModalResizeTransition(
  elementRef: RefObject<HTMLElement | null>,
  {
    active,
    enabled,
    durationMs,
  }: UseModalResizeTransitionOptions,
) {
  const previousTargetSizeRef = useRef<ModalSurfaceSize | null>(null);
  const animationRef = useRef<Animation | null>(null);

  const transitionToCurrentSize = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const activeAnimation = animationRef.current;
    const interruptedSize = activeAnimation
      ? readModalSurfaceSize(element)
      : null;
    activeAnimation?.cancel();
    animationRef.current = null;

    const targetSize = readModalSurfaceSize(element);
    const previousTargetSize = previousTargetSizeRef.current;
    previousTargetSizeRef.current = targetSize;

    if (
      !active
      || !enabled
      || durationMs <= 0
      || previousTargetSize == null
      || prefersReducedMotion()
      || typeof element.animate !== "function"
    ) {
      return;
    }

    const startSize = interruptedSize ?? previousTargetSize;
    if (!hasModalSurfaceSizeChanged(startSize, targetSize)) return;

    const animation = element.animate(
      [
        {
          width: `${startSize.width}px`,
          height: `${startSize.height}px`,
        },
        {
          width: `${targetSize.width}px`,
          height: `${targetSize.height}px`,
        },
      ],
      {
        duration: Math.max(0, durationMs),
        easing: MODAL_RESIZE_EASING,
        fill: "none",
      },
    );
    animationRef.current = animation;
    const clearAnimation = () => {
      if (animationRef.current === animation) {
        animationRef.current = null;
      }
    };
    animation.onfinish = clearAnimation;
    animation.oncancel = clearAnimation;
  }, [active, durationMs, elementRef, enabled]);

  useLayoutEffect(() => {
    transitionToCurrentSize();
  });

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (!animationRef.current) {
        transitionToCurrentSize();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, transitionToCurrentSize]);

  useLayoutEffect(() => () => {
    animationRef.current?.cancel();
    animationRef.current = null;
  }, []);
}
