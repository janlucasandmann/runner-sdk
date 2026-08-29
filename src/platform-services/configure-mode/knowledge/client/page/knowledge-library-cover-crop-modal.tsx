import { ArrowLeft, ZoomIn, ZoomOut } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import { PlatformPrimaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformIconButton } from "../../../../../platform-ui/components/ui/icon-button/index.js";

const MIN_COVER_ZOOM = 1;
const MAX_COVER_ZOOM = 3;
const COVER_ZOOM_STEP = 0.05;

export interface KnowledgeLibraryCoverView {
  positionX: number;
  positionY: number;
  zoom: number;
}

export const DEFAULT_KNOWLEDGE_LIBRARY_COVER_VIEW: KnowledgeLibraryCoverView = Object.freeze({
  positionX: 50,
  positionY: 50,
  zoom: 1,
});

export interface KnowledgeLibraryCoverCropModalProps {
  open: boolean;
  imageSrc: string;
  imageName?: string;
  aspectRatio?: number;
  initialView?: Partial<KnowledgeLibraryCoverView> | null;
  pending?: boolean;
  error?: string;
  onCancel: () => void;
  onApply: (view: KnowledgeLibraryCoverView) => void | Promise<void>;
}

interface CoverDragState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPositionX: number;
  startPositionY: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function normalizeFiniteNumber(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeKnowledgeLibraryCoverView(
  view: Partial<KnowledgeLibraryCoverView> | null | undefined,
): KnowledgeLibraryCoverView {
  return {
    positionX: clamp(
      normalizeFiniteNumber(view?.positionX, DEFAULT_KNOWLEDGE_LIBRARY_COVER_VIEW.positionX),
      0,
      100,
    ),
    positionY: clamp(
      normalizeFiniteNumber(view?.positionY, DEFAULT_KNOWLEDGE_LIBRARY_COVER_VIEW.positionY),
      0,
      100,
    ),
    zoom: clamp(
      normalizeFiniteNumber(view?.zoom, DEFAULT_KNOWLEDGE_LIBRARY_COVER_VIEW.zoom),
      MIN_COVER_ZOOM,
      MAX_COVER_ZOOM,
    ),
  };
}

function normalizeAspectRatio(value: number | undefined): number {
  return clamp(normalizeFiniteNumber(value, 3), 1.5, 5);
}

export function KnowledgeLibraryCoverCropModal({
  open,
  imageSrc,
  imageName = "Cover image",
  aspectRatio = 3,
  initialView,
  pending = false,
  error = "",
  onCancel,
  onApply,
}: KnowledgeLibraryCoverCropModalProps) {
  const cropAreaRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<CoverDragState | null>(null);
  const [view, setView] = useState<KnowledgeLibraryCoverView>(() =>
    normalizeKnowledgeLibraryCoverView(initialView),
  );
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open || !imageSrc) return;
    setView(normalizeKnowledgeLibraryCoverView(initialView));
    setImageReady(false);
    setImageFailed(false);
    setDragging(false);
    dragStateRef.current = null;
  }, [imageSrc, initialView, open]);

  const updateZoom = (zoom: number) => {
    setView((current) => normalizeKnowledgeLibraryCoverView({ ...current, zoom }));
  };

  const updatePosition = (positionX: number, positionY: number) => {
    setView((current) => normalizeKnowledgeLibraryCoverView({ ...current, positionX, positionY }));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!imageReady || pending) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPositionX: view.positionX,
      startPositionY: view.positionY,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const horizontalDelta = ((event.clientX - dragState.startClientX) / bounds.width) * 100;
    const verticalDelta = ((event.clientY - dragState.startClientY) / bounds.height) * 100;
    updatePosition(
      dragState.startPositionX - horizontalDelta / view.zoom,
      dragState.startPositionY - verticalDelta / view.zoom,
    );
  };

  const finishDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragStateRef.current = null;
    setDragging(false);
  };

  const handleCropKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!imageReady || pending) return;
    const movement = event.shiftKey ? 5 : 1;
    if (event.key === "ArrowLeft") updatePosition(view.positionX - movement, view.positionY);
    else if (event.key === "ArrowRight") updatePosition(view.positionX + movement, view.positionY);
    else if (event.key === "ArrowUp") updatePosition(view.positionX, view.positionY - movement);
    else if (event.key === "ArrowDown") updatePosition(view.positionX, view.positionY + movement);
    else return;
    event.preventDefault();
  };

  const cropStyle = {
    "--knowledge-library-cover-crop-aspect-ratio": String(normalizeAspectRatio(aspectRatio)),
  } as CSSProperties;
  const imageStyle: CSSProperties = {
    objectPosition: `${view.positionX}% ${view.positionY}%`,
    transform: `scale(${view.zoom})`,
    transformOrigin: `${view.positionX}% ${view.positionY}%`,
  };

  return (
    <PlatformModal
      open={open}
      visible={open}
      title="Adjust cover"
      size="wide"
      className="knowledge-library-cover-crop-modal"
      bodyClassName="knowledge-library-cover-crop-modal__body"
      headerClassName="knowledge-library-cover-crop-modal__header"
      titleClassName="knowledge-library-cover-crop-modal__title"
      closeButtonClassName="knowledge-library-cover-crop-modal__default-close"
      closeOnBackdrop={!pending}
      closeOnEscape={!pending}
      closeButtonDisabled={pending}
      initialFocusRef={cropAreaRef}
      headerLeading={
        <PlatformIconButton
          type="button"
          size="compact"
          className="knowledge-library-cover-crop-modal__back"
          aria-label="Back to cover selection"
          disabled={pending}
          onClick={onCancel}
        >
          <ArrowLeft aria-hidden="true" />
        </PlatformIconButton>
      }
      headerActions={
        <PlatformPrimaryButton
          type="button"
          size="small"
          className="knowledge-library-cover-crop-modal__apply"
          disabled={pending || !imageReady || imageFailed}
          onClick={() => void onApply(normalizeKnowledgeLibraryCoverView(view))}
        >
          {pending ? "Applying…" : "Apply"}
        </PlatformPrimaryButton>
      }
      onClose={() => {
        if (!pending) onCancel();
      }}
    >
      <div className={`knowledge-library-cover-crop-modal__stage${imageReady ? " is-ready" : ""}`}>
        <img
          className="knowledge-library-cover-crop-modal__source-preview"
          src={imageSrc}
          alt=""
          draggable={false}
          onLoad={() => {
            setImageReady(true);
            setImageFailed(false);
          }}
          onError={() => {
            setImageReady(false);
            setImageFailed(true);
          }}
        />
        <div
          ref={cropAreaRef}
          className={`knowledge-library-cover-crop-modal__crop-area${dragging ? " is-dragging" : ""}`}
          style={cropStyle}
          role="application"
          aria-label="Cover image visible area"
          aria-describedby="knowledge-library-cover-crop-help"
          tabIndex={imageReady && !pending ? 0 : -1}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDragging}
          onPointerCancel={finishDragging}
          onKeyDown={handleCropKeyDown}
        >
          {imageReady ? (
            <img
              className="knowledge-library-cover-crop-modal__crop-image"
              src={imageSrc}
              alt={imageName}
              style={imageStyle}
              draggable={false}
            />
          ) : null}
        </div>
        {!imageReady && !imageFailed ? (
          <PlatformLoadingState
            centered
            className="knowledge-library-cover-crop-modal__loading"
            message="Loading cover image"
          />
        ) : null}
        {imageFailed ? (
          <div className="knowledge-library-cover-crop-modal__image-error" role="alert">
            The selected image could not be loaded.
          </div>
        ) : null}
      </div>

      <div className="knowledge-library-cover-crop-modal__controls">
        <PlatformIconButton
          type="button"
          size="compact"
          aria-label="Zoom out"
          disabled={pending || !imageReady || view.zoom <= MIN_COVER_ZOOM}
          onClick={() => updateZoom(view.zoom - 0.1)}
        >
          <ZoomOut aria-hidden="true" />
        </PlatformIconButton>
        <input
          className="knowledge-library-cover-crop-modal__zoom"
          type="range"
          min={MIN_COVER_ZOOM}
          max={MAX_COVER_ZOOM}
          step={COVER_ZOOM_STEP}
          value={view.zoom}
          aria-label="Cover zoom"
          aria-valuetext={`${Math.round(view.zoom * 100)}%`}
          disabled={pending || !imageReady}
          onChange={(event) => updateZoom(Number(event.currentTarget.value))}
        />
        <PlatformIconButton
          type="button"
          size="compact"
          aria-label="Zoom in"
          disabled={pending || !imageReady || view.zoom >= MAX_COVER_ZOOM}
          onClick={() => updateZoom(view.zoom + 0.1)}
        >
          <ZoomIn aria-hidden="true" />
        </PlatformIconButton>
      </div>
      <p
        id="knowledge-library-cover-crop-help"
        className="knowledge-library-cover-crop-modal__help"
      >
        Drag the image or use the arrow keys to choose the visible area.
      </p>
      {error ? (
        <div className="knowledge-library-cover-crop-modal__error" role="alert">
          {error}
        </div>
      ) : null}
    </PlatformModal>
  );
}
