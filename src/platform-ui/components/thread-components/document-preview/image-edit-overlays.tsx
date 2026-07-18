import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface RunnerImageNaturalSize {
  width: number;
  height: number;
}

export interface RunnerImagePoint {
  x: number;
  y: number;
  brushSize?: number;
  viewportScale?: number;
}

export interface RunnerImageMaskStroke {
  id: string;
  brushSize: number;
  points: Array<{ x: number; y: number }>;
}

export interface RunnerImageCropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RunnerImageCropTarget = "new" | "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

interface RunnerImageSelectionMaskOverlayProps {
  active: boolean;
  naturalSize: RunnerImageNaturalSize;
  strokes: RunnerImageMaskStroke[];
  draftStroke?: RunnerImageMaskStroke | null;
  brushSize?: number;
  onPointerStart?: (point: RunnerImagePoint) => void;
  onPointerMove?: (point: RunnerImagePoint) => void;
  onPointerEnd?: () => void;
}

interface RunnerImageCropOverlayProps {
  active: boolean;
  naturalSize: RunnerImageNaturalSize;
  cropRect?: RunnerImageCropRect | null;
  draftRect?: RunnerImageCropRect | null;
  dragTarget?: RunnerImageCropTarget;
  onPointerStart?: (point: RunnerImagePoint, target: RunnerImageCropTarget) => void;
  onPointerMove?: (point: RunnerImagePoint) => void;
  onPointerEnd?: () => void;
}

function getRunnerImageMaskViewportRect(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
) {
  const safeContainerWidth = Math.max(1, Number(containerWidth) || 1);
  const safeContainerHeight = Math.max(1, Number(containerHeight) || 1);
  const safeNaturalWidth = Math.max(1, Number(naturalWidth) || 1);
  const safeNaturalHeight = Math.max(1, Number(naturalHeight) || 1);
  const scale = Math.min(safeContainerWidth / safeNaturalWidth, safeContainerHeight / safeNaturalHeight);
  const width = safeNaturalWidth * scale;
  const height = safeNaturalHeight * scale;
  return {
    x: (safeContainerWidth - width) / 2,
    y: (safeContainerHeight - height) / 2,
    width,
    height,
    scale,
  };
}

function getRunnerImageOverlayViewportRect(canvas: HTMLCanvasElement, naturalWidth: number, naturalHeight: number) {
  const canvasRect = canvas.getBoundingClientRect();
  const fallbackRect = getRunnerImageMaskViewportRect(
    canvasRect.width,
    canvasRect.height,
    naturalWidth,
    naturalHeight,
  );
  const surface = canvas.closest(".tb-runner-image-preview-surface");
  const image = surface?.querySelector(".tb-runner-image-preview-surface-image");
  const imageRect = image?.getBoundingClientRect();
  if (
    !imageRect
    || imageRect.width <= 0
    || imageRect.height <= 0
    || !Number(naturalWidth)
    || !Number(naturalHeight)
  ) {
    return fallbackRect;
  }
  return {
    x: imageRect.left - canvasRect.left,
    y: imageRect.top - canvasRect.top,
    width: imageRect.width,
    height: imageRect.height,
    scale: Math.min(
      imageRect.width / Math.max(1, Number(naturalWidth) || 1),
      imageRect.height / Math.max(1, Number(naturalHeight) || 1),
    ),
  };
}

function drawRunnerImageMaskStroke(
  ctx: CanvasRenderingContext2D,
  stroke: RunnerImageMaskStroke & { scale?: number },
  toCanvasPoint: (point: { x: number; y: number }) => { x: number; y: number },
) {
  const points = Array.isArray(stroke.points) ? stroke.points : [];
  if (!points.length) {
    return;
  }
  const lineWidth = Math.max(2, Number(stroke.brushSize || 1) * Number(stroke.scale || 1));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "rgba(102, 166, 255, 0.86)";
  ctx.fillStyle = "rgba(102, 166, 255, 0.72)";
  if (points.length === 1) {
    const point = toCanvasPoint(points[0]);
    ctx.beginPath();
    ctx.arc(point.x, point.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  const first = toCanvasPoint(points[0]);
  ctx.moveTo(first.x, first.y);
  for (let index = 1; index < points.length; index += 1) {
    const point = toCanvasPoint(points[index]);
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

function prepareOverlayCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const nextWidth = Math.max(1, Math.round(rect.width * dpr));
  const nextHeight = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, rect };
}

export function RunnerImageSelectionMaskOverlay({
  active,
  naturalSize,
  strokes,
  draftStroke,
  brushSize = 44,
  onPointerStart,
  onPointerMove,
  onPointerEnd,
}: RunnerImageSelectionMaskOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prepared = prepareOverlayCanvas(canvas);
    if (!prepared || !active) return;
    const { ctx } = prepared;
    const viewportRect = getRunnerImageOverlayViewportRect(canvas, naturalSize.width, naturalSize.height);
    const toCanvasPoint = (point: { x: number; y: number }) => ({
      x: viewportRect.x + Number(point?.x || 0) * viewportRect.scale,
      y: viewportRect.y + Number(point?.y || 0) * viewportRect.scale,
    });
    ctx.save();
    ctx.beginPath();
    ctx.rect(viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height);
    ctx.clip();
    const allStrokes = [
      ...(Array.isArray(strokes) ? strokes : []),
      ...(draftStroke ? [draftStroke] : []),
    ];
    allStrokes.forEach((stroke) => {
      drawRunnerImageMaskStroke(ctx, { ...stroke, scale: viewportRect.scale }, toCanvasPoint);
    });
    ctx.restore();
  }, [active, brushSize, draftStroke, naturalSize.height, naturalSize.width, strokes]);

  const getNaturalPointerPoint = (event: ReactPointerEvent<HTMLElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const viewportRect = getRunnerImageOverlayViewportRect(canvas, naturalSize.width, naturalSize.height);
    const localX = event.clientX - rect.left - viewportRect.x;
    const localY = event.clientY - rect.top - viewportRect.y;
    if (localX < 0 || localY < 0 || localX > viewportRect.width || localY > viewportRect.height) {
      return null;
    }
    return {
      x: Math.max(0, Math.min(Number(naturalSize.width || 1), localX / viewportRect.scale)),
      y: Math.max(0, Math.min(Number(naturalSize.height || 1), localY / viewportRect.scale)),
      brushSize: Math.max(8, Number(brushSize || 42) / viewportRect.scale),
    };
  };

  return (
    <span
      className="tb-image-preview-mask-overlay"
      onPointerDown={(event) => {
        if (!active) return;
        const point = getNaturalPointerPoint(event);
        if (!point) return;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        onPointerStart?.(point);
      }}
      onPointerMove={(event) => {
        if (!active || event.buttons !== 1) return;
        const point = getNaturalPointerPoint(event);
        if (!point) return;
        event.preventDefault();
        onPointerMove?.(point);
      }}
      onPointerUp={(event) => {
        if (!active) return;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
        onPointerEnd?.();
      }}
      onPointerCancel={(event) => {
        if (!active) return;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        onPointerEnd?.();
      }}
    >
      <canvas ref={canvasRef} className="tb-image-preview-mask-canvas" aria-label="Selected image edit area" />
    </span>
  );
}

export function RunnerImageCropOverlay({
  active,
  naturalSize,
  cropRect,
  draftRect,
  dragTarget = "new",
  onPointerStart,
  onPointerMove,
  onPointerEnd,
}: RunnerImageCropOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cursor, setCursor] = useState("crosshair");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prepared = prepareOverlayCanvas(canvas);
    if (!prepared || !active) return;
    const { ctx } = prepared;
    const viewportRect = getRunnerImageOverlayViewportRect(canvas, naturalSize.width, naturalSize.height);
    const normalizedCropRect = draftRect || cropRect || null;

    ctx.save();
    ctx.beginPath();
    ctx.rect(viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height);
    ctx.clip();
    ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
    ctx.fillRect(viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height);

    if (normalizedCropRect && Number(normalizedCropRect.width || 0) > 0 && Number(normalizedCropRect.height || 0) > 0) {
      const cropCanvasRect = {
        x: viewportRect.x + Number(normalizedCropRect.x || 0) * viewportRect.scale,
        y: viewportRect.y + Number(normalizedCropRect.y || 0) * viewportRect.scale,
        width: Number(normalizedCropRect.width || 0) * viewportRect.scale,
        height: Number(normalizedCropRect.height || 0) * viewportRect.scale,
      };
      ctx.clearRect(cropCanvasRect.x, cropCanvasRect.y, cropCanvasRect.width, cropCanvasRect.height);
      ctx.strokeStyle = "#66a6ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        cropCanvasRect.x + 1,
        cropCanvasRect.y + 1,
        Math.max(0, cropCanvasRect.width - 2),
        Math.max(0, cropCanvasRect.height - 2),
      );
      ctx.fillStyle = "#66a6ff";
      const handleSize = 7;
      [
        [cropCanvasRect.x, cropCanvasRect.y],
        [cropCanvasRect.x + cropCanvasRect.width, cropCanvasRect.y],
        [cropCanvasRect.x, cropCanvasRect.y + cropCanvasRect.height],
        [cropCanvasRect.x + cropCanvasRect.width, cropCanvasRect.y + cropCanvasRect.height],
      ].forEach(([x, y]) => {
        ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
      });
    }
    ctx.restore();
  }, [active, cropRect, draftRect, naturalSize.height, naturalSize.width]);

  const getNaturalPointerPoint = (event: ReactPointerEvent<HTMLElement>, options: { clampOutside?: boolean } = {}) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const viewportRect = getRunnerImageOverlayViewportRect(canvas, naturalSize.width, naturalSize.height);
    const rawLocalX = event.clientX - rect.left - viewportRect.x;
    const rawLocalY = event.clientY - rect.top - viewportRect.y;
    if (
      !options.clampOutside
      && (rawLocalX < 0 || rawLocalY < 0 || rawLocalX > viewportRect.width || rawLocalY > viewportRect.height)
    ) {
      return null;
    }
    const localX = Math.max(0, Math.min(viewportRect.width, rawLocalX));
    const localY = Math.max(0, Math.min(viewportRect.height, rawLocalY));
    return {
      x: Math.max(0, Math.min(Number(naturalSize.width || 1), localX / viewportRect.scale)),
      y: Math.max(0, Math.min(Number(naturalSize.height || 1), localY / viewportRect.scale)),
      viewportScale: viewportRect.scale,
    };
  };

  const getCropHitTarget = (point: RunnerImagePoint | null): RunnerImageCropTarget => {
    const rect = cropRect;
    if (!rect || !point) return "new";
    const scale = Math.max(0.0001, Number(point.viewportScale || 1));
    const threshold = Math.max(6, 12 / scale);
    const left = Number(rect.x || 0);
    const top = Number(rect.y || 0);
    const right = left + Number(rect.width || 0);
    const bottom = top + Number(rect.height || 0);
    const nearLeft = Math.abs(point.x - left) <= threshold && point.y >= top - threshold && point.y <= bottom + threshold;
    const nearRight = Math.abs(point.x - right) <= threshold && point.y >= top - threshold && point.y <= bottom + threshold;
    const nearTop = Math.abs(point.y - top) <= threshold && point.x >= left - threshold && point.x <= right + threshold;
    const nearBottom = Math.abs(point.y - bottom) <= threshold && point.x >= left - threshold && point.x <= right + threshold;
    if (nearLeft && nearTop) return "nw";
    if (nearRight && nearTop) return "ne";
    if (nearLeft && nearBottom) return "sw";
    if (nearRight && nearBottom) return "se";
    if (nearLeft) return "w";
    if (nearRight) return "e";
    if (nearTop) return "n";
    if (nearBottom) return "s";
    return "new";
  };

  const getCursorForTarget = (target: RunnerImageCropTarget) => {
    const normalizedTarget = dragTarget && dragTarget !== "new" ? dragTarget : target;
    if (normalizedTarget === "n" || normalizedTarget === "s") return "ns-resize";
    if (normalizedTarget === "e" || normalizedTarget === "w") return "ew-resize";
    if (normalizedTarget === "nw" || normalizedTarget === "se") return "nwse-resize";
    if (normalizedTarget === "ne" || normalizedTarget === "sw") return "nesw-resize";
    return "crosshair";
  };

  return (
    <span
      className="tb-image-preview-crop-overlay"
      style={{ cursor }}
      onPointerDown={(event) => {
        if (!active) return;
        const point = getNaturalPointerPoint(event);
        if (!point) return;
        const target = getCropHitTarget(point);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        setCursor(getCursorForTarget(target));
        onPointerStart?.(point, target);
      }}
      onPointerMove={(event) => {
        if (!active) return;
        const point = getNaturalPointerPoint(event, { clampOutside: event.buttons === 1 });
        if (!point) return;
        if (event.buttons === 1) {
          event.preventDefault();
          onPointerMove?.(point);
          return;
        }
        setCursor(getCursorForTarget(getCropHitTarget(point)));
      }}
      onPointerUp={(event) => {
        if (!active) return;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
        setCursor("crosshair");
        onPointerEnd?.();
      }}
      onPointerCancel={(event) => {
        if (!active) return;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        setCursor("crosshair");
        onPointerEnd?.();
      }}
    >
      <canvas ref={canvasRef} className="tb-image-preview-crop-canvas" aria-label="Image crop area" />
    </span>
  );
}
