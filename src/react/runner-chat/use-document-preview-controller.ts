import {
  type Dispatch,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl,
  isRunnerPreviewHtmlFile,
  resolveRunnerPreviewAssetUrl,
} from "../runner-document-preview.js";
import type { RunnerAttachment, RunnerTurnAttachment } from "./attachment-types.js";
import { isAttachmentDocumentPreviewable } from "./attachment-utils.js";
import type { RunnerImagePreviewSelectionState } from "./image-selection.js";
import { normalizeTurnAttachment } from "./turn-attachments.js";

const DOCUMENT_PREVIEW_ACTIVE_CLASS = "tb-runner-document-preview-active";
const DOCUMENT_PREVIEW_MAXIMIZED_CLASS = "tb-runner-document-preview-maximized";

export interface UseRunnerDocumentPreviewControllerOptions {
  backendUrl?: string;
  initialAttachment?: RunnerTurnAttachment | RunnerAttachment | null;
  initialAttachmentToken?: string | number | null;
  onBeforeOpen?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface RunnerDocumentPreviewController {
  attachment: RunnerTurnAttachment | null;
  imageSelectionState: RunnerImagePreviewSelectionState | null;
  setImageSelectionState: Dispatch<SetStateAction<RunnerImagePreviewSelectionState | null>>;
  maximized: boolean;
  actionMenuOpen: boolean;
  setActionMenuOpen: Dispatch<SetStateAction<boolean>>;
  drawerWidth: number | null;
  actionMenuRef: MutableRefObject<HTMLSpanElement | null>;
  close: () => void;
  toggleAttachment: (attachment: RunnerTurnAttachment) => void;
  toggleMaximized: () => void;
  startResize: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  getOpenUrl: (attachment?: RunnerTurnAttachment | null) => string;
  copyValue: (value: string) => void;
}

export function useRunnerDocumentPreviewController({
  backendUrl = "",
  initialAttachment = null,
  initialAttachmentToken = null,
  onBeforeOpen,
  onOpenChange,
}: UseRunnerDocumentPreviewControllerOptions = {}): RunnerDocumentPreviewController {
  const [attachment, setAttachment] = useState<RunnerTurnAttachment | null>(null);
  const [imageSelectionState, setImageSelectionState] =
    useState<RunnerImagePreviewSelectionState | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLSpanElement | null>(null);
  const resizeStateRef = useRef<{
    startX: number;
    startWidth: number;
  } | null>(null);
  const handledInitialTokenRef = useRef<string | number | null>(null);
  const onBeforeOpenRef = useRef(onBeforeOpen);

  useEffect(() => {
    onBeforeOpenRef.current = onBeforeOpen;
  }, [onBeforeOpen]);

  const close = useCallback(() => {
    setAttachment(null);
    setImageSelectionState(null);
    setMaximized(false);
    setActionMenuOpen(false);
  }, []);

  const toggleAttachment = useCallback((nextAttachment: RunnerTurnAttachment) => {
    if (!isAttachmentDocumentPreviewable(nextAttachment)) return;
    onBeforeOpenRef.current?.();
    setActionMenuOpen(false);
    setAttachment((current) => {
      if (current?.id === nextAttachment.id) {
        setMaximized(false);
        return null;
      }
      setMaximized(false);
      return nextAttachment;
    });
  }, []);

  const toggleMaximized = useCallback(() => {
    setActionMenuOpen(false);
    setMaximized((current) => !current);
  }, []);

  const startResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (typeof window === "undefined") return;
    const width = event.currentTarget.parentElement?.getBoundingClientRect().width;
    if (!width) return;
    resizeStateRef.current = {
      startX: event.clientX,
      startWidth: width,
    };
    event.preventDefault();
  }, []);

  const getOpenUrl = useCallback(
    (targetAttachment: RunnerTurnAttachment | null = attachment): string => {
      if (!targetAttachment) return "";
      const baseFileUrl = targetAttachment.previewUrl || targetAttachment.url || "";
      const htmlPreviewUrl =
        typeof targetAttachment.htmlPreviewUrl === "string" &&
        targetAttachment.htmlPreviewUrl.trim()
          ? targetAttachment.htmlPreviewUrl
          : isRunnerPreviewHtmlFile(targetAttachment.filename, targetAttachment.mimeType)
            ? buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl(
                baseFileUrl,
                targetAttachment.filename,
                targetAttachment.mimeType,
              )
            : "";
      return (
        resolveRunnerPreviewAssetUrl(
          htmlPreviewUrl || baseFileUrl,
          backendUrl,
          targetAttachment.id,
        ) ||
        resolveRunnerPreviewAssetUrl(baseFileUrl, backendUrl, targetAttachment.id) ||
        ""
      );
    },
    [attachment, backendUrl],
  );

  const copyValue = useCallback((value: string) => {
    if (!value.trim() || typeof navigator === "undefined") return;
    void navigator.clipboard?.writeText(value);
    setActionMenuOpen(false);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle(DOCUMENT_PREVIEW_ACTIVE_CLASS, Boolean(attachment));
    document.body.classList.toggle(
      DOCUMENT_PREVIEW_MAXIMIZED_CLASS,
      Boolean(attachment && maximized),
    );
    return () => {
      document.body.classList.remove(DOCUMENT_PREVIEW_ACTIVE_CLASS);
      document.body.classList.remove(DOCUMENT_PREVIEW_MAXIMIZED_CLASS);
    };
  }, [attachment, maximized]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Preview-local state resets when the attachment identity changes.
  useEffect(() => {
    setDrawerWidth(null);
    resizeStateRef.current = null;
    setActionMenuOpen(false);
    setImageSelectionState(null);
  }, [attachment?.id]);

  useEffect(() => {
    if (!initialAttachment) return;
    const attachmentRecord =
      typeof initialAttachment === "object" ? (initialAttachment as Record<string, unknown>) : {};
    const requestToken =
      initialAttachmentToken ??
      String(
        attachmentRecord.id || attachmentRecord.workspacePath || attachmentRecord.filename || "",
      ).trim();

    if (
      requestToken === null ||
      requestToken === "" ||
      handledInitialTokenRef.current === requestToken
    ) {
      return;
    }

    const normalizedAttachment = normalizeTurnAttachment(initialAttachment, backendUrl);
    if (!normalizedAttachment || !isAttachmentDocumentPreviewable(normalizedAttachment)) {
      return;
    }

    handledInitialTokenRef.current = requestToken;
    onBeforeOpenRef.current?.();
    setActionMenuOpen(false);
    setMaximized(false);
    setAttachment(normalizedAttachment);
  }, [backendUrl, initialAttachment, initialAttachmentToken]);

  useEffect(() => {
    if (!actionMenuOpen || typeof document === "undefined") return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && actionMenuRef.current?.contains(target)) {
        return;
      }
      const targetElement =
        target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      if (targetElement?.closest("[data-platform-resource-actions-owner]")) {
        return;
      }
      setActionMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [actionMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePointerMove = (event: PointerEvent) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) return;
      const minWidth = 360;
      const maxWidth = Math.max(minWidth, Math.min(960, window.innerWidth - 220));
      setDrawerWidth(
        Math.max(
          minWidth,
          Math.min(maxWidth, resizeState.startWidth + (resizeState.startX - event.clientX)),
        ),
      );
    };
    const stopResize = () => {
      resizeStateRef.current = null;
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    };
  }, []);

  useEffect(() => {
    onOpenChange?.(Boolean(attachment));
  }, [attachment, onOpenChange]);

  useEffect(
    () => () => {
      onOpenChange?.(false);
    },
    [onOpenChange],
  );

  return {
    attachment,
    imageSelectionState,
    setImageSelectionState,
    maximized,
    actionMenuOpen,
    setActionMenuOpen,
    drawerWidth,
    actionMenuRef,
    close,
    toggleAttachment,
    toggleMaximized,
    startResize,
    getOpenUrl,
    copyValue,
  };
}
