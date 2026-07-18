import type {
  RunnerImageCropRect,
  RunnerImageCropTarget,
  RunnerImageNaturalSize,
  RunnerImagePoint,
} from "./image-edit-overlays.js";

export interface RunnerImageCropDragState {
  mode: RunnerImageCropTarget;
  startPoint: RunnerImagePoint;
  startRect: RunnerImageCropRect | null;
}

const RUNNER_IMAGE_MIN_ZOOM = 0.35;
const RUNNER_IMAGE_MAX_ZOOM = 5;
const RUNNER_IMAGE_ZOOM_SNAP_TOLERANCE = 0.025;

function clampRunnerImageCoordinate(value: number, maximum: number): number {
  return Math.max(0, Math.min(maximum, Number(value || 0)));
}

export function normalizeRunnerImageZoom(value: number): number {
  const base = Number.isFinite(value) && value > 0 ? value : 1;
  const next = Math.max(RUNNER_IMAGE_MIN_ZOOM, Math.min(RUNNER_IMAGE_MAX_ZOOM, base));
  return Math.abs(next - 1) < RUNNER_IMAGE_ZOOM_SNAP_TOLERANCE ? 1 : next;
}

export function applyRunnerImageWheelZoom(
  current: number,
  deltaY: number,
  options?: { modified?: boolean },
): number {
  if (!Number.isFinite(deltaY) || deltaY === 0) {
    return normalizeRunnerImageZoom(current);
  }
  const sensitivity = options?.modified ? 0.004 : 0.0022;
  return normalizeRunnerImageZoom(current * Math.exp(-deltaY * sensitivity));
}

export function stepRunnerImageZoom(current: number, direction: -1 | 1): number {
  return normalizeRunnerImageZoom(current * (direction > 0 ? 1.2 : 1 / 1.2));
}

export function buildRunnerImageCropRect(
  naturalSize: RunnerImageNaturalSize,
  startPoint: RunnerImagePoint,
  endPoint: RunnerImagePoint,
): RunnerImageCropRect {
  const width = Math.max(1, Number(naturalSize.width || 1));
  const height = Math.max(1, Number(naturalSize.height || 1));
  const startX = clampRunnerImageCoordinate(startPoint?.x, width);
  const startY = clampRunnerImageCoordinate(startPoint?.y, height);
  const endX = clampRunnerImageCoordinate(endPoint?.x, width);
  const endY = clampRunnerImageCoordinate(endPoint?.y, height);
  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.max(0, Math.abs(endX - startX)),
    height: Math.max(0, Math.abs(endY - startY)),
  };
}

export function buildRunnerImageCropRectFromDrag(
  naturalSize: RunnerImageNaturalSize,
  dragState: RunnerImageCropDragState | null,
  point: RunnerImagePoint,
  minimumSize = 8,
): RunnerImageCropRect | null {
  if (!dragState) {
    return null;
  }
  if (dragState.mode === "new") {
    return buildRunnerImageCropRect(naturalSize, dragState.startPoint, point);
  }

  const imageWidth = Math.max(1, Number(naturalSize.width || 1));
  const imageHeight = Math.max(1, Number(naturalSize.height || 1));
  const startRect = dragState.startRect || {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  let left = Number(startRect.x || 0);
  let top = Number(startRect.y || 0);
  let right = left + Number(startRect.width || 0);
  let bottom = top + Number(startRect.height || 0);
  const target = String(dragState.mode || "new");

  if (target.includes("w")) {
    left = Math.max(0, Math.min(right - minimumSize, Number(point.x || 0)));
  }
  if (target.includes("e")) {
    right = Math.min(imageWidth, Math.max(left + minimumSize, Number(point.x || 0)));
  }
  if (target.includes("n")) {
    top = Math.max(0, Math.min(bottom - minimumSize, Number(point.y || 0)));
  }
  if (target.includes("s")) {
    bottom = Math.min(imageHeight, Math.max(top + minimumSize, Number(point.y || 0)));
  }

  const clampedLeft = clampRunnerImageCoordinate(left, imageWidth);
  const clampedTop = clampRunnerImageCoordinate(top, imageHeight);
  const clampedRight = clampRunnerImageCoordinate(right, imageWidth);
  const clampedBottom = clampRunnerImageCoordinate(bottom, imageHeight);
  return {
    x: clampedLeft,
    y: clampedTop,
    width: Math.max(0, clampedRight - clampedLeft),
    height: Math.max(0, clampedBottom - clampedTop),
  };
}
