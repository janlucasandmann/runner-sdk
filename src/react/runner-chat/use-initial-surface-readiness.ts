import {
  useEffect,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";
import { RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS } from "../runner-chat-animations.js";

export type RunnerInitialSurfacePhase = "loading" | "entering" | "ready";

export interface UseRunnerInitialSurfaceReadinessOptions {
  blocked: boolean;
  rootRef: RefObject<HTMLElement | null>;
}

const RUNNER_INITIAL_MEDIA_WAIT_TIMEOUT_MS = 2_500;

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    window.setTimeout(resolve, 0);
  });
}

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete) {
    return typeof image.decode === "function"
      ? image.decode().catch(() => undefined)
      : Promise.resolve();
  }
  if (typeof image.decode === "function") {
    return image.decode().catch(() => undefined);
  }
  return new Promise((resolve) => {
    const finish = () => resolve();
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

async function waitForRunnerInitialSurfaceLayout(
  root: HTMLElement | null,
): Promise<void> {
  const fontReady = typeof document !== "undefined" && document.fonts
    ? document.fonts.ready.catch(() => undefined)
    : Promise.resolve();
  const imageReady = root
    ? Promise.all(
        Array.from(root.querySelectorAll("img"))
          .filter((image) => !image.closest(".tb-runner-chat__initial-loader"))
          .map(waitForImage),
      )
    : Promise.resolve();
  let timeoutId: number | null = null;
  const timeout = new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    timeoutId = window.setTimeout(resolve, RUNNER_INITIAL_MEDIA_WAIT_TIMEOUT_MS);
  });

  await Promise.race([
    Promise.all([fontReady, imageReady]).then(() => undefined),
    timeout,
  ]);
  if (timeoutId !== null && typeof window !== "undefined") {
    window.clearTimeout(timeoutId);
  }

  // The first frame commits image/font metrics. The second gives responsive
  // minimaps and ResizeObservers one complete layout pass before reveal.
  await waitForNextPaint();
  await waitForNextPaint();
}

/**
 * Holds an initial thread surface behind the shared loader until all of its
 * authoritative data and first-layout dependencies are ready. Later live
 * updates remain visible and do not re-run the page entrance transition.
 */
export function useRunnerInitialSurfaceReadiness({
  blocked,
  rootRef,
}: UseRunnerInitialSurfaceReadinessOptions): RunnerInitialSurfacePhase {
  const [phase, setPhase] = useState<RunnerInitialSurfacePhase>(() => (
    blocked ? "loading" : "ready"
  ));

  useLayoutEffect(() => {
    if (blocked) {
      setPhase("loading");
    }
  }, [blocked]);

  useEffect(() => {
    if (blocked || phase !== "loading") {
      return undefined;
    }

    let cancelled = false;
    void waitForRunnerInitialSurfaceLayout(rootRef.current).then(() => {
      if (cancelled) return;
      setPhase("entering");
    });

    return () => {
      cancelled = true;
    };
  }, [blocked, phase, rootRef]);

  useEffect(() => {
    if (blocked || phase !== "entering") {
      return undefined;
    }
    const completionTimer = window.setTimeout(() => {
      setPhase("ready");
    }, RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS);
    return () => window.clearTimeout(completionTimer);
  }, [blocked, phase]);

  return blocked ? "loading" : phase;
}
