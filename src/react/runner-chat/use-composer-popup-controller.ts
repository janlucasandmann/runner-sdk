import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  emitRunnerComposerPopupOpen,
  getMainPopupRenderId,
  getRunnerComposerPopupEventSource,
  getSidePopupRenderId,
  type InputPopupId,
  isPlusPopupId,
  type MainPopupRenderId,
  POPUP_ANIMATION_DURATION_MS,
  type PopupAnimationPhase,
  RUNNER_COMPOSER_POPUP_OPEN_EVENT,
  type SidePopupExitDirection,
  type SidePopupRenderId,
} from "./composer-popup.js";

export type RunnerComposerPopupCloseMode = "default" | "outside";

export interface UseRunnerComposerPopupControllerOptions {
  onClose?: () => void;
}

export interface RunnerComposerPopupController {
  activeInputPopup: InputPopupId | null;
  setActiveInputPopup: Dispatch<SetStateAction<InputPopupId | null>>;
  renderedMainPopup: MainPopupRenderId | null;
  mainPopupPhase: PopupAnimationPhase;
  renderedSidePopup: SidePopupRenderId | null;
  sidePopupPhase: PopupAnimationPhase;
  sidePopupExitDirection: SidePopupExitDirection;
  closeAllInputPopups: (mode?: RunnerComposerPopupCloseMode) => void;
  toggleMainMenu: () => void;
  openPlusPopup: (
    popup: Exclude<InputPopupId, "context" | "agent" | "agent-reasoning" | "environment">,
  ) => void;
  togglePopup: (popup: InputPopupId) => void;
}

export function useRunnerComposerPopupController({
  onClose,
}: UseRunnerComposerPopupControllerOptions = {}): RunnerComposerPopupController {
  const [activeInputPopup, setActiveInputPopup] = useState<InputPopupId | null>(null);
  const [renderedMainPopup, setRenderedMainPopup] = useState<MainPopupRenderId | null>(null);
  const [mainPopupPhase, setMainPopupPhase] = useState<PopupAnimationPhase>("idle");
  const [renderedSidePopup, setRenderedSidePopup] = useState<SidePopupRenderId | null>(null);
  const [sidePopupPhase, setSidePopupPhase] = useState<PopupAnimationPhase>("idle");
  const [sidePopupExitDirection, setSidePopupExitDirection] =
    useState<SidePopupExitDirection>("left");
  const sourceIdRef = useRef(`runner-chat:${Math.random().toString(36).slice(2)}`);
  const mainAnimationTimerRef = useRef<number | null>(null);
  const sideAnimationTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const targetMainPopup = getMainPopupRenderId(activeInputPopup);
  const targetSidePopup = getSidePopupRenderId(activeInputPopup);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (mainAnimationTimerRef.current !== null) {
      window.clearTimeout(mainAnimationTimerRef.current);
      mainAnimationTimerRef.current = null;
    }

    if (targetMainPopup === null) {
      if (renderedMainPopup !== null) {
        setMainPopupPhase("exit");
        mainAnimationTimerRef.current = window.setTimeout(() => {
          setRenderedMainPopup(null);
          setMainPopupPhase("idle");
          mainAnimationTimerRef.current = null;
        }, POPUP_ANIMATION_DURATION_MS);
      }
      return;
    }

    setRenderedMainPopup(targetMainPopup);
    setMainPopupPhase("enter");
    mainAnimationTimerRef.current = window.setTimeout(() => {
      setMainPopupPhase("idle");
      mainAnimationTimerRef.current = null;
    }, POPUP_ANIMATION_DURATION_MS);
  }, [renderedMainPopup, targetMainPopup]);

  useEffect(() => {
    if (sideAnimationTimerRef.current !== null) {
      window.clearTimeout(sideAnimationTimerRef.current);
      sideAnimationTimerRef.current = null;
    }

    if (targetSidePopup === null) {
      if (renderedSidePopup !== null) {
        setSidePopupPhase("exit");
        sideAnimationTimerRef.current = window.setTimeout(() => {
          setRenderedSidePopup(null);
          setSidePopupPhase("idle");
          setSidePopupExitDirection("left");
          sideAnimationTimerRef.current = null;
        }, POPUP_ANIMATION_DURATION_MS);
      }
      return;
    }

    setSidePopupExitDirection("left");
    setRenderedSidePopup(targetSidePopup);
    setSidePopupPhase("enter");
    sideAnimationTimerRef.current = window.setTimeout(() => {
      setSidePopupPhase("idle");
      sideAnimationTimerRef.current = null;
    }, POPUP_ANIMATION_DURATION_MS);
  }, [renderedSidePopup, targetSidePopup]);

  useEffect(
    () => () => {
      if (mainAnimationTimerRef.current !== null) {
        window.clearTimeout(mainAnimationTimerRef.current);
      }
      if (sideAnimationTimerRef.current !== null) {
        window.clearTimeout(sideAnimationTimerRef.current);
      }
    },
    [],
  );

  const closeAllInputPopups = useCallback(
    (mode: RunnerComposerPopupCloseMode = "default") => {
      const hasStackedPlusPopupsOpen =
        renderedSidePopup !== null &&
        (renderedMainPopup === "main" || isPlusPopupId(activeInputPopup));

      if (mode === "outside" && hasStackedPlusPopupsOpen) {
        setSidePopupExitDirection("down");
      }
      setActiveInputPopup(null);
      onCloseRef.current?.();
    },
    [activeInputPopup, renderedMainPopup, renderedSidePopup],
  );

  useEffect(() => {
    if (!activeInputPopup) return;
    emitRunnerComposerPopupOpen(sourceIdRef.current);
  }, [activeInputPopup]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleComposerPopupOpen = (event: Event) => {
      const sourceId = getRunnerComposerPopupEventSource(event);
      if (!sourceId || sourceId === sourceIdRef.current) return;
      closeAllInputPopups();
    };

    window.addEventListener(RUNNER_COMPOSER_POPUP_OPEN_EVENT, handleComposerPopupOpen);
    return () =>
      window.removeEventListener(RUNNER_COMPOSER_POPUP_OPEN_EVENT, handleComposerPopupOpen);
  }, [closeAllInputPopups]);

  const toggleMainMenu = useCallback(() => {
    setActiveInputPopup((current) => (isPlusPopupId(current) ? null : "main"));
  }, []);

  const openPlusPopup = useCallback(
    (popup: Exclude<InputPopupId, "context" | "agent" | "agent-reasoning" | "environment">) => {
      setActiveInputPopup(popup);
    },
    [],
  );

  const togglePopup = useCallback((popup: InputPopupId) => {
    setActiveInputPopup((current) => (current === popup ? null : popup));
  }, []);

  return {
    activeInputPopup,
    setActiveInputPopup,
    renderedMainPopup,
    mainPopupPhase,
    renderedSidePopup,
    sidePopupPhase,
    sidePopupExitDirection,
    closeAllInputPopups,
    toggleMainMenu,
    openPlusPopup,
    togglePopup,
  };
}
