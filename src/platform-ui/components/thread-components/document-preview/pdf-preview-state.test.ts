import { describe, expect, it } from "vitest";
import {
  clampRunnerPdfPage,
  clampRunnerPdfZoom,
  RUNNER_PDF_MAX_ZOOM,
  RUNNER_PDF_MIN_ZOOM,
  stepRunnerPdfZoom,
} from "./pdf-preview-state.js";

describe("PDF preview state", () => {
  it("clamps and rounds zoom values", () => {
    expect(clampRunnerPdfZoom(Number.NaN)).toBe(1);
    expect(clampRunnerPdfZoom(0.1)).toBe(RUNNER_PDF_MIN_ZOOM);
    expect(clampRunnerPdfZoom(4)).toBe(RUNNER_PDF_MAX_ZOOM);
    expect(clampRunnerPdfZoom(1.234)).toBe(1.23);
  });

  it("steps zoom without crossing the supported range", () => {
    expect(stepRunnerPdfZoom(1, 1)).toBe(1.2);
    expect(stepRunnerPdfZoom(1, -1)).toBe(0.8);
    expect(stepRunnerPdfZoom(RUNNER_PDF_MIN_ZOOM, -1)).toBe(RUNNER_PDF_MIN_ZOOM);
    expect(stepRunnerPdfZoom(RUNNER_PDF_MAX_ZOOM, 1)).toBe(RUNNER_PDF_MAX_ZOOM);
  });

  it("keeps page navigation inside the loaded document", () => {
    expect(clampRunnerPdfPage(-3, 8)).toBe(1);
    expect(clampRunnerPdfPage(4.9, 8)).toBe(4);
    expect(clampRunnerPdfPage(12, 8)).toBe(8);
    expect(clampRunnerPdfPage(Number.NaN, 0)).toBe(1);
  });
});
