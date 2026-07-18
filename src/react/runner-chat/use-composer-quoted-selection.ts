import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { RunnerQuotedSelection } from "./turn-types.js";

export const COMPOSER_QUOTED_SELECTION_ANIMATION_MS = 220;

export interface RunnerComposerQuotedSelectionController {
  selection: RunnerQuotedSelection | null;
  setSelection: Dispatch<SetStateAction<RunnerQuotedSelection | null>>;
  renderedSelection: RunnerQuotedSelection | null;
  visible: boolean;
  clear: () => void;
}

export function useRunnerComposerQuotedSelection(): RunnerComposerQuotedSelectionController {
  const [selection, setSelection] = useState<RunnerQuotedSelection | null>(null);
  const [renderedSelection, setRenderedSelection] = useState<RunnerQuotedSelection | null>(null);
  const [visible, setVisible] = useState(false);
  const animationTimerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    setSelection(null);
  }, []);

  useEffect(
    () => () => {
      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    if (selection) {
      setRenderedSelection(selection);
      const animationFrameId = window.requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => window.cancelAnimationFrame(animationFrameId);
    }

    setVisible(false);
    if (!renderedSelection) {
      return;
    }

    animationTimerRef.current = window.setTimeout(() => {
      setRenderedSelection(null);
      animationTimerRef.current = null;
    }, COMPOSER_QUOTED_SELECTION_ANIMATION_MS);

    return () => {
      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, [renderedSelection, selection]);

  return {
    selection,
    setSelection,
    renderedSelection,
    visible,
    clear,
  };
}
