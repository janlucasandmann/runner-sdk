export const RUNNER_PDF_MIN_ZOOM = 0.4;
export const RUNNER_PDF_MAX_ZOOM = 3;
export const RUNNER_PDF_ZOOM_STEP = 0.2;

export function clampRunnerPdfZoom(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(RUNNER_PDF_MIN_ZOOM, Math.min(RUNNER_PDF_MAX_ZOOM, Number(value.toFixed(2))));
}

export function stepRunnerPdfZoom(current: number, direction: -1 | 1): number {
  return clampRunnerPdfZoom(current + RUNNER_PDF_ZOOM_STEP * direction);
}

export function clampRunnerPdfPage(page: number, pageCount: number): number {
  const normalizedPageCount = Math.max(1, Math.floor(pageCount || 1));
  const normalizedPage = Number.isFinite(page) ? Math.floor(page) : 1;
  return Math.max(1, Math.min(normalizedPage, normalizedPageCount));
}
