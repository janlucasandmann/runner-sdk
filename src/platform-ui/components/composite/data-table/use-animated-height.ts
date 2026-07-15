import {
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";

interface UseAnimatedHeightOptions {
  enabled: boolean;
  changeKey: string;
  duration?: number;
  easing?: string;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useAnimatedHeight<TElement extends HTMLElement>({
  enabled,
  changeKey,
  duration = 180,
  easing = "cubic-bezier(0.22, 1, 0.36, 1)",
}: UseAnimatedHeightOptions): RefObject<TElement | null> {
  const elementRef = useRef<TElement | null>(null);
  const previousTargetHeightRef = useRef<number | null>(null);
  const animationRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const runningAnimation = animationRef.current;
    const interruptedHeight = runningAnimation
      ? element.getBoundingClientRect().height
      : null;
    runningAnimation?.cancel();
    animationRef.current = null;

    const targetHeight = element.getBoundingClientRect().height;
    const previousTargetHeight = previousTargetHeightRef.current;
    previousTargetHeightRef.current = targetHeight;

    if (
      !enabled
      || previousTargetHeight == null
      || prefersReducedMotion()
      || typeof element.animate !== "function"
    ) {
      return;
    }

    const startHeight = interruptedHeight ?? previousTargetHeight;
    if (Math.abs(targetHeight - startHeight) < 0.5) return;

    const animation = element.animate(
      [
        { height: `${startHeight}px` },
        { height: `${targetHeight}px` },
      ],
      {
        duration,
        easing,
        fill: "none",
      },
    );
    animationRef.current = animation;
    const clearAnimation = () => {
      if (animationRef.current === animation) animationRef.current = null;
    };
    animation.onfinish = clearAnimation;
    animation.oncancel = clearAnimation;
  }, [changeKey, duration, easing, enabled]);

  useLayoutEffect(() => () => {
    animationRef.current?.cancel();
    animationRef.current = null;
  }, []);

  return elementRef;
}
