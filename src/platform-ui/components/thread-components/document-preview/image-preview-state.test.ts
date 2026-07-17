import { describe, expect, it } from "vitest";
import {
  applyRunnerImageWheelZoom,
  buildRunnerImageCropRect,
  buildRunnerImageCropRectFromDrag,
  normalizeRunnerImageZoom,
  stepRunnerImageZoom,
} from "./image-preview-state.js";

const naturalSize = { width: 1200, height: 800 };

describe("image preview state", () => {
  it("normalizes, steps, and bounds image zoom", () => {
    expect(normalizeRunnerImageZoom(Number.NaN)).toBe(1);
    expect(normalizeRunnerImageZoom(0.1)).toBe(0.35);
    expect(normalizeRunnerImageZoom(6)).toBe(5);
    expect(normalizeRunnerImageZoom(1.01)).toBe(1);
    expect(stepRunnerImageZoom(1, 1)).toBe(1.2);
    expect(stepRunnerImageZoom(1.2, -1)).toBe(1);
    expect(applyRunnerImageWheelZoom(1, -100)).toBeGreaterThan(1);
    expect(applyRunnerImageWheelZoom(1, 100)).toBeLessThan(1);
  });

  it("builds crop rectangles in any drag direction and clamps to the image", () => {
    expect(buildRunnerImageCropRect(naturalSize, { x: 900, y: 700 }, { x: 100, y: -50 })).toEqual({
      x: 100,
      y: 0,
      width: 800,
      height: 700,
    });
    expect(buildRunnerImageCropRect(naturalSize, { x: -20, y: 20 }, { x: 1400, y: 900 })).toEqual({
      x: 0,
      y: 20,
      width: 1200,
      height: 780,
    });
  });

  it("resizes crop handles while enforcing minimum size and image bounds", () => {
    expect(
      buildRunnerImageCropRectFromDrag(
        naturalSize,
        {
          mode: "nw",
          startPoint: { x: 100, y: 100 },
          startRect: { x: 100, y: 100, width: 400, height: 300 },
        },
        { x: 498, y: 398 },
      ),
    ).toEqual({
      x: 492,
      y: 392,
      width: 8,
      height: 8,
    });
    expect(
      buildRunnerImageCropRectFromDrag(
        naturalSize,
        {
          mode: "se",
          startPoint: { x: 100, y: 100 },
          startRect: { x: 100, y: 100, width: 400, height: 300 },
        },
        { x: 1800, y: 1200 },
      ),
    ).toEqual({
      x: 100,
      y: 100,
      width: 1100,
      height: 700,
    });
    expect(
      buildRunnerImageCropRectFromDrag(naturalSize, null, {
        x: 100,
        y: 100,
      }),
    ).toBeNull();
  });
});
