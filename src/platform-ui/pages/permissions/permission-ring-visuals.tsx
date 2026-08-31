import { ArrowDownToLine, ArrowUpFromLine, Shield, UserRound } from "../../components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useRef, type ElementType } from "react";
import {
  getPlatformPermissionAccessProgress,
  getPlatformPermissionRingEndColor,
  getPlatformPermissionRingGradientColors,
  getPlatformPermissionRingRgba,
  getPlatformPermissionRingStartColor,
  normalizePlatformPermissionAccess,
  PLATFORM_PERMISSION_ACCESS_OPTIONS,
  PLATFORM_PERMISSION_MINI_RING_GRADIENTS,
  PLATFORM_PERMISSION_RING_GRADIENTS,
} from "./permission-model.js";
import type {
  PlatformPermissionAccess,
  PlatformPermissionAccessOption,
  PlatformPermissionRingDefinition,
} from "./permission-types.js";

const CHART_SIZE = 148;
const CHART_LINE_WIDTH = 17;
const CHART_GAP = 1;
const CHART_OUTER_PADDING = 3;
const CHART_START_ANGLE = -Math.PI / 2 - 0.18;
const FULL_CAP_START_OFFSET = -0.18;
const FULL_CAP_END_OFFSET = 0.32;
const FULL_CAP_CLIP_OFFSET = 0.14;
const MINI_RING_SIZE = 24;
const MINI_RING_LINE_WIDTH = 1;
const MINI_RING_PADDING = 2.9;

const DEFAULT_RING_ICONS: Readonly<Record<string, ElementType>> = {
  ring_1: ArrowDownToLine,
  ring_2: UserRound,
  ring_3: ArrowUpFromLine,
};

function getRingIcon(ring: Pick<PlatformPermissionRingDefinition, "id" | "icon">): ElementType {
  return ring.icon || DEFAULT_RING_ICONS[ring.id] || Shield;
}

function getRingRadius(size: number, index: number): number {
  return size / 2
    - CHART_LINE_WIDTH / 2
    - CHART_OUTER_PADDING
    - index * (CHART_LINE_WIDTH + CHART_GAP);
}

function createRingGradient(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  ringId: string,
  alpha = 1,
  progress = 0.72,
  gradients = PLATFORM_PERMISSION_RING_GRADIENTS,
): CanvasGradient {
  const colors = getPlatformPermissionRingGradientColors(ringId, gradients);
  if (typeof context.createConicGradient === "function") {
    const gradient = context.createConicGradient(CHART_START_ANGLE, width / 2, height / 2);
    const endStop = Math.max(0.001, Math.min(0.94, Number(progress) || 0.72));
    const holdStop = Math.min(0.965, Math.max(endStop + 0.03, endStop));
    gradient.addColorStop(0, getPlatformPermissionRingRgba(colors[0], alpha));
    gradient.addColorStop(endStop, getPlatformPermissionRingRgba(colors[1], alpha));
    gradient.addColorStop(holdStop, getPlatformPermissionRingRgba(colors[1], alpha));
    gradient.addColorStop(0.985, getPlatformPermissionRingRgba(colors[0], alpha));
    gradient.addColorStop(1, getPlatformPermissionRingRgba(colors[0], alpha));
    return gradient;
  }
  const gradient = context.createLinearGradient(width / 2, 0, width / 2, height);
  gradient.addColorStop(0, getPlatformPermissionRingRgba(colors[0], alpha));
  gradient.addColorStop(1, getPlatformPermissionRingRgba(colors[1], alpha));
  return gradient;
}

function prepareCanvas(canvas: HTMLCanvasElement, fallbackSize: number) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || fallbackSize));
  const height = Math.max(1, Math.round(rect.height || fallbackSize));
  const dpr = Math.max(1, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1);
  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  return { context, width, height };
}

function drawFullRingCap(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius: number,
  lineWidth: number,
  ringId: string,
) {
  const fullCapStartAngle = CHART_START_ANGLE + FULL_CAP_START_OFFSET;
  const fullCapEndAngle = CHART_START_ANGLE + FULL_CAP_END_OFFSET;
  const capClipAngle = CHART_START_ANGLE + FULL_CAP_CLIP_OFFSET;
  const capClipX = centerX + Math.cos(capClipAngle) * radius;

  context.save();
  context.beginPath();
  context.rect(capClipX + lineWidth * 0.08, 0, width - capClipX, height);
  context.clip();
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.strokeStyle = getPlatformPermissionRingEndColor(ringId, 1);
  context.shadowColor = "rgba(0, 0, 0, 0.45)";
  context.shadowBlur = Math.max(3, lineWidth * 0.8);
  context.shadowOffsetX = Math.max(1, lineWidth * 0.24);
  context.shadowOffsetY = Math.max(0.5, lineWidth * 0.14);
  context.beginPath();
  context.arc(centerX, centerY, radius, fullCapStartAngle, fullCapEndAngle);
  context.stroke();
  context.restore();

  context.save();
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.strokeStyle = getPlatformPermissionRingEndColor(ringId, 1);
  context.beginPath();
  context.arc(centerX, centerY, radius, fullCapStartAngle, fullCapEndAngle);
  context.stroke();
  context.restore();
}

function drawPermissionRings(
  canvas: HTMLCanvasElement | null,
  rings: readonly PlatformPermissionRingDefinition[],
  progressById: Readonly<Record<string, number>>,
) {
  if (!canvas) return;
  const prepared = prepareCanvas(canvas, CHART_SIZE);
  if (!prepared) return;
  const { context, width, height } = prepared;
  const size = Math.min(width, height);
  const centerX = width / 2;
  const centerY = height / 2;

  rings.forEach((ring, index) => {
    const radius = getRingRadius(size, index);
    const progress = Math.max(0, Math.min(100, Number(progressById[ring.id]) || 0)) / 100;
    const activeGradient = createRingGradient(context, width, height, ring.id, 1, progress);
    const trackGradient = createRingGradient(context, width, height, ring.id, 0.1);

    context.save();
    context.lineWidth = CHART_LINE_WIDTH;
    context.lineCap = "round";
    context.strokeStyle = trackGradient;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    if (progress <= 0) return;
    const endAngle = CHART_START_ANGLE + Math.PI * 2 * Math.min(progress, 1);
    context.save();
    context.lineWidth = CHART_LINE_WIDTH;
    context.strokeStyle = activeGradient;
    context.lineCap = "butt";
    context.beginPath();
    context.arc(centerX, centerY, radius, CHART_START_ANGLE, endAngle);
    context.stroke();
    context.restore();

    if (progress < 0.999) {
      const startCapX = centerX + Math.cos(CHART_START_ANGLE) * radius;
      const startCapY = centerY + Math.sin(CHART_START_ANGLE) * radius;
      const endCapX = centerX + Math.cos(endAngle) * radius;
      const endCapY = centerY + Math.sin(endAngle) * radius;
      context.save();
      context.fillStyle = getPlatformPermissionRingStartColor(ring.id, 1);
      context.beginPath();
      context.arc(startCapX, startCapY, CHART_LINE_WIDTH / 2, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = getPlatformPermissionRingEndColor(ring.id, 1);
      context.beginPath();
      context.arc(endCapX, endCapY, CHART_LINE_WIDTH / 2, 0, Math.PI * 2);
      context.fill();
      context.restore();
      return;
    }

    drawFullRingCap(context, width, height, centerX, centerY, radius, CHART_LINE_WIDTH, ring.id);
  });
}

function drawMiniRing(canvas: HTMLCanvasElement | null, ringId: string, progressValue: number) {
  if (!canvas) return;
  const prepared = prepareCanvas(canvas, MINI_RING_SIZE);
  if (!prepared) return;
  const { context, width, height } = prepared;
  const size = Math.min(width, height);
  const centerX = width / 2;
  const centerY = height / 2;
  const lineWidth = Math.max(1, size * (MINI_RING_LINE_WIDTH / MINI_RING_SIZE));
  const padding = Math.max(2, size * (MINI_RING_PADDING / MINI_RING_SIZE));
  const radius = Math.max(1, size / 2 - lineWidth / 2 - padding);
  const progress = Math.max(0, Math.min(100, Number(progressValue) || 0)) / 100;
  const trackGradient = createRingGradient(
    context,
    width,
    height,
    ringId,
    0.12,
    1,
    PLATFORM_PERMISSION_MINI_RING_GRADIENTS,
  );
  const activeGradient = createRingGradient(
    context,
    width,
    height,
    ringId,
    1,
    progress,
    PLATFORM_PERMISSION_MINI_RING_GRADIENTS,
  );

  context.save();
  context.lineWidth = lineWidth;
  context.strokeStyle = trackGradient;
  context.lineCap = "butt";
  context.beginPath();
  context.arc(centerX, centerY, radius, CHART_START_ANGLE, CHART_START_ANGLE + Math.PI * 2);
  context.stroke();
  context.restore();

  if (progress <= 0) return;
  const endAngle = CHART_START_ANGLE + Math.PI * 2 * Math.min(progress, 1);
  context.save();
  context.lineWidth = lineWidth;
  context.strokeStyle = activeGradient;
  context.lineCap = progress < 0.999 ? "round" : "butt";
  context.beginPath();
  context.arc(centerX, centerY, radius, CHART_START_ANGLE, endAngle);
  context.stroke();
  context.restore();
  if (progress >= 0.999) {
    drawFullRingCap(context, width, height, centerX, centerY, radius, lineWidth, ringId);
  }
}

function easeOut(value: number): number {
  return 1 - Math.pow(1 - value, 4);
}

export function PlatformPermissionMiniRingIcon({
  ringId,
  access,
  accessOptions = PLATFORM_PERMISSION_ACCESS_OPTIONS,
  icon,
}: {
  ringId: string;
  access?: PlatformPermissionAccess;
  accessOptions?: readonly PlatformPermissionAccessOption[];
  icon?: ElementType;
}) {
  const normalizedAccess = access == null
    ? ""
    : normalizePlatformPermissionAccess(access, accessOptions, "no_access");
  const progress = normalizedAccess ? getPlatformPermissionAccessProgress(normalizedAccess, accessOptions) : 100;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const RingIcon = icon || DEFAULT_RING_ICONS[ringId] || Shield;

  useEffect(() => {
    const redraw = () => drawMiniRing(canvasRef.current, ringId, progress);
    redraw();
    if (typeof window === "undefined") return undefined;
    window.addEventListener("resize", redraw);
    return () => window.removeEventListener("resize", redraw);
  }, [progress, ringId]);

  return (
    <span
      className={`platform-permission-mini-ring-icon playground-permission-mini-ring-icon is-${ringId.replace("_", "-")}`}
      aria-hidden="true"
      style={{ "--permission-mini-ring-icon-color": getPlatformPermissionRingEndColor(ringId, 1) } as React.CSSProperties}
    >
      <canvas ref={canvasRef} className="platform-permission-mini-ring-icon__canvas playground-permission-mini-ring-canvas" />
      <RingIcon strokeWidth={2.4} />
    </span>
  );
}

export function PlatformPermissionRingsChart({
  rings,
  ringAccessById,
  accessOptions = PLATFORM_PERMISSION_ACCESS_OPTIONS,
  animationKey = 0,
}: {
  rings: readonly PlatformPermissionRingDefinition[];
  ringAccessById: Readonly<Record<string, PlatformPermissionAccess>>;
  accessOptions?: readonly PlatformPermissionAccessOption[];
  animationKey?: string | number;
}) {
  const chartRings = useMemo(() => [...rings].reverse(), [rings]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const displayProgressRef = useRef<Record<string, number>>({});
  const previousProgressRef = useRef<Record<string, number> | null>(null);
  const previousAnimationKeyRef = useRef<string | number>(animationKey);
  const ringAccessSignature = JSON.stringify(ringAccessById);

  useEffect(() => {
    const redraw = () => drawPermissionRings(canvasRef.current, chartRings, displayProgressRef.current);
    if (typeof window === "undefined") return undefined;
    window.addEventListener("resize", redraw);
    return () => {
      window.removeEventListener("resize", redraw);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [chartRings]);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return undefined;
    const nextProgress = Object.fromEntries(
      chartRings.map((ring) => [
        ring.id,
        getPlatformPermissionAccessProgress(ringAccessById[ring.id], accessOptions),
      ]),
    );
    const resetAnimation = previousAnimationKeyRef.current !== animationKey;
    const previousProgress = resetAnimation ? null : previousProgressRef.current;
    const changedRingIds = previousProgress
      ? chartRings.filter((ring) => previousProgress[ring.id] !== nextProgress[ring.id]).map((ring) => ring.id)
      : chartRings.map((ring) => ring.id);

    if (!previousProgress) {
      displayProgressRef.current = Object.fromEntries(chartRings.map((ring) => [ring.id, 0]));
    }
    previousProgressRef.current = nextProgress;
    previousAnimationKeyRef.current = animationKey;
    if (changedRingIds.length === 0) {
      drawPermissionRings(canvasRef.current, chartRings, displayProgressRef.current);
      return undefined;
    }
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    const fromProgress = Object.fromEntries(
      changedRingIds.map((ringId) => [ringId, displayProgressRef.current[ringId] ?? 0]),
    );
    const startedAt = performance.now();
    const animate = (timestamp: number) => {
      const progress = Math.min(1, Math.max(0, (timestamp - startedAt) / 260));
      const easedProgress = easeOut(progress);
      chartRings.forEach((ring) => {
        if (!changedRingIds.includes(ring.id)) {
          displayProgressRef.current[ring.id] = nextProgress[ring.id];
          return;
        }
        const from = fromProgress[ring.id] ?? 0;
        displayProgressRef.current[ring.id] = from + (nextProgress[ring.id] - from) * easedProgress;
      });
      drawPermissionRings(canvasRef.current, chartRings, displayProgressRef.current);
      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        displayProgressRef.current = { ...nextProgress };
        drawPermissionRings(canvasRef.current, chartRings, displayProgressRef.current);
        animationFrameRef.current = null;
      }
    };
    animationFrameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [accessOptions, animationKey, chartRings, ringAccessSignature]);

  return (
    <div className="platform-permission-rings-chart playground-permission-rings-chart">
      <canvas
        ref={canvasRef}
        className="platform-permission-rings-chart__canvas playground-permission-rings-canvas"
        role="img"
        aria-label="Permission ring access levels"
      />
      {chartRings.map((ring, index) => {
        const RingIcon = getRingIcon(ring);
        const radius = getRingRadius(CHART_SIZE, index);
        return (
          <span
            key={ring.id}
            className={`platform-permission-rings-chart__icon playground-permission-rings-icon is-${ring.id}`}
            style={{ "--permission-ring-icon-top": `${CHART_SIZE / 2 - radius}px` } as React.CSSProperties}
          >
            <RingIcon strokeWidth={2.6} />
          </span>
        );
      })}
    </div>
  );
}
