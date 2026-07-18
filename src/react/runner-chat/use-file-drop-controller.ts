import { type DragEvent, useCallback, useEffect, useRef, useState } from "react";

export interface UseRunnerFileDropControllerOptions {
  onFilesDropped: (files: File[]) => boolean;
}

function isExternalFileDrag(event: { dataTransfer?: DataTransfer | null }): boolean {
  const types = event.dataTransfer?.types;
  return Boolean(types && Array.from(types).includes("Files"));
}

export function useRunnerFileDropController({
  onFilesDropped,
}: UseRunnerFileDropControllerOptions) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onFilesDroppedRef = useRef(onFilesDropped);
  const screenDragActiveRef = useRef(false);
  const [isScreenDragActive, setIsScreenDragActive] = useState(false);
  const [isDropzoneDragging, setIsDropzoneDragging] = useState(false);

  useEffect(() => {
    onFilesDroppedRef.current = onFilesDropped;
  }, [onFilesDropped]);

  const setScreenDragActive = useCallback((active: boolean) => {
    screenDragActiveRef.current = active;
    setIsScreenDragActive(active);
  }, []);

  const resetDragState = useCallback(() => {
    setScreenDragActive(false);
    setIsDropzoneDragging(false);
  }, [setScreenDragActive]);

  useEffect(() => {
    if (!isScreenDragActive) return;
    const clearScreenFileDrag = () => setScreenDragActive(false);
    window.addEventListener("drop", clearScreenFileDrag);
    window.addEventListener("dragend", clearScreenFileDrag);
    window.addEventListener("blur", clearScreenFileDrag);
    return () => {
      window.removeEventListener("drop", clearScreenFileDrag);
      window.removeEventListener("dragend", clearScreenFileDrag);
      window.removeEventListener("blur", clearScreenFileDrag);
    };
  }, [isScreenDragActive, setScreenDragActive]);

  const handleRootDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!isExternalFileDrag(event)) return;
      event.preventDefault();
      if (!screenDragActiveRef.current) setScreenDragActive(true);
    },
    [setScreenDragActive],
  );

  const handleRootDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!isExternalFileDrag(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      if (!screenDragActiveRef.current) setScreenDragActive(true);
    },
    [setScreenDragActive],
  );

  const handleRootDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!isExternalFileDrag(event)) return;
      const rootElement = rootRef.current;
      if (!rootElement) {
        setScreenDragActive(false);
        return;
      }
      const bounds = rootElement.getBoundingClientRect();
      const hasLeftRoot =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;
      if (hasLeftRoot) setScreenDragActive(false);
    },
    [setScreenDragActive],
  );

  const handleRootDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!isExternalFileDrag(event)) return;
      event.preventDefault();
      setScreenDragActive(false);
      onFilesDroppedRef.current(Array.from(event.dataTransfer.files || []));
    },
    [setScreenDragActive],
  );

  const handleDropzoneDragOver = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDropzoneDragging(true);
  }, []);
  const handleDropzoneDragLeave = useCallback(() => {
    setIsDropzoneDragging(false);
  }, []);
  const handleDropzoneDrop = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDropzoneDragging(false);
    onFilesDroppedRef.current(Array.from(event.dataTransfer.files || []));
  }, []);

  return {
    rootRef,
    isScreenDragActive,
    isDropzoneDragging,
    resetDragState,
    handleRootDragEnter,
    handleRootDragOver,
    handleRootDragLeave,
    handleRootDrop,
    handleDropzoneDragOver,
    handleDropzoneDragLeave,
    handleDropzoneDrop,
  };
}
